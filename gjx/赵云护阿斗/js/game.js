/* 游戏主逻辑
 * 管理游戏状态、主循环、波次、碰撞等
 */

const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    WIN: 'win',
    LOSE: 'lose',
};

const BASE_GOLD = 150;
const BASE_HEALTH = 100;
const BASE_REFRESH_COST = 20;
const WAVE_INTERVAL = 6; // 波次间隔（秒）
const WAVE_INTERVAL_MIN = 5;
const FIRST_WAVE_DELAY = 5; // 第一波开始前等待时间

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.state = GAME_STATE.MENU;
        this.level = 1;
        this.gold = BASE_GOLD;
        this.health = BASE_HEALTH;
        this.maxHealth = BASE_HEALTH;
        this.kills = 0;
        this.refreshCost = BASE_REFRESH_COST;

        this.map = null;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.unitPool = [];
        this.selectedUnitIndex = -1;
        this._lastGold = -1; // 用于检测金币变化，避免每帧重建卡片DOM

        // 波次
        this.waves = [];
        this.currentWave = 0;     // 已开始的波数（0表示还没开始）
        this.waveTimer = 0;       // 下一波倒计时
        this.waveState = 'idle';  // idle / spawning / between / all_done
        this.spawnQueue = [];
        this.allSpawned = false;  // 所有波次敌人是否都已生成
        this.winDelay = 0;        // 胜利延迟

        // 特效
        this.effects = [];

        // 浮动消息
        this.messageText = '';
        this.messageTimer = 0;

        // 鼠标位置
        this.mouseX = 0;
        this.mouseY = 0;
        this.hoverGrid = { x: -1, y: -1 };

        // 动画
        this.lastTime = 0;
        this.animationId = null;

        // UI
        this.ui = new UIManager(this);

        // 绑定事件
        this.bindEvents();

        // 初始化UI
        this.ui.init();
        this.drawMenuBackground();

        // 检查缩略图模式
        const urlParams = new URLSearchParams(window.search || window.location.search);
        if (urlParams.get('thumbnail') === '1') {
            return;
        }
    }

    bindEvents() {
        // 鼠标事件
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.hoverGrid = { x: -1, y: -1 };
        });

        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const px = touch.clientX - rect.left;
            const py = touch.clientY - rect.top;
            this.mouseX = px;
            this.mouseY = py;
            if (this.map) {
                this.hoverGrid = this.map.pixelToGrid(px, py);
            }
            this.onClick({ clientX: touch.clientX, clientY: touch.clientY });
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = touch.clientX - rect.left;
            this.mouseY = touch.clientY - rect.top;
            if (this.map) {
                this.hoverGrid = this.map.pixelToGrid(this.mouseX, this.mouseY);
            }
        }, { passive: false });

        // 可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state === GAME_STATE.PLAYING) {
                this.togglePause();
            }
        });

        // 键盘
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.PAUSED) {
                    this.togglePause();
                }
            }
            if (e.key === ' ' && this.state === GAME_STATE.PLAYING) {
                e.preventDefault();
                this.togglePause();
            }
        });
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;

        if (this.map) {
            this.hoverGrid = this.map.pixelToGrid(this.mouseX, this.mouseY);
        }
    }

    onClick(e) {
        if (this.state !== GAME_STATE.PLAYING) return;
        if (this.selectedUnitIndex < 0) return;
        if (!this.map) return;

        console.log('[放置] 点击画布，当前选中武将索引:', this.selectedUnitIndex);

        // 从事件计算画布坐标
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        console.log('[放置] 原始坐标:', e.clientX, e.clientY, '画布坐标:', clickX, clickY);

        this.mouseX = clickX;
        this.mouseY = clickY;
        this.hoverGrid = this.map.pixelToGrid(clickX, clickY);

        const grid = this.hoverGrid;
        console.log('[放置] 网格坐标:', grid.x, grid.y);

        const unitData = this.unitPool[this.selectedUnitIndex];
        console.log('[放置] 选中武将:', unitData.hero.name, '费用:', unitData.hero.cost, '当前金币:', this.gold);

        const pixelPos = this.map.gridToPixel(grid.x, grid.y);

        // 边界检查
        if (grid.x < 0 || grid.x >= this.map.cols || grid.y < 0 || grid.y >= this.map.rows) {
            console.log('[放置] 失败：超出边界');
            return;
        }

        // 检查是否在草地上
        const tileType = this.map.tiles[grid.y] && this.map.tiles[grid.y][grid.x];
        console.log('[放置] 瓦片类型:', tileType, '0=草地 1=路径 2=起点 3=终点 4=石头');

        if (!this.map.canPlaceAt(grid.x, grid.y)) {
            console.log('[放置] 失败：不能放置在此瓦片');
            this.addEffect({
                type: 'place_fail',
                x: pixelPos.x,
                y: pixelPos.y,
                timer: 0.4,
                maxTimer: 0.4,
            });
            this.flashMessage('只能在草地上部署');
            return;
        }

        // 检查是否已有塔
        const existing = this.towers.find(t => t.gridX === grid.x && t.gridY === grid.y);
        if (existing) {
            console.log('[放置] 失败：此处已有武将');
            this.addEffect({
                type: 'place_fail',
                x: pixelPos.x,
                y: pixelPos.y,
                timer: 0.4,
                maxTimer: 0.4,
            });
            this.flashMessage('此处已有武将');
            return;
        }

        // 检查金币
        if (this.gold < unitData.hero.cost) {
            console.log('[放置] 失败：金币不足');
            this.flashMessage('金币不足');
            return;
        }

        // 部署
        console.log('[放置] 成功！放置', unitData.hero.name, '于', grid.x, grid.y);
        this.gold -= unitData.hero.cost;
        const tower = new Tower(unitData.hero, unitData.type, grid.x, grid.y, this.map);
        this.towers.push(tower);

        // 放置特效
        this.addEffect({
            type: 'place',
            x: tower.x,
            y: tower.y,
            timer: 0.4,
            maxTimer: 0.4,
            color: unitData.hero.accent,
        });

        this.ui.updateStats(this.level, this.waves.length, this.currentWave, this.gold, this.health, this.maxHealth);
        this.ui.updateCardStates(this.unitPool, this.gold, this.selectedUnitIndex);

        // 金币不够就取消选中
        if (this.gold < unitData.hero.cost) {
            this.selectedUnitIndex = -1;
            this.ui.setSelectedIndex(-1);
        }
    }

    flashMessage(text) {
        this.messageText = text;
        this.messageTimer = 1.2;
    }

    // ============ 游戏状态控制 ============

    startGame() {
        this.level = 1;
        this.gold = BASE_GOLD;
        this.health = BASE_HEALTH;
        this.maxHealth = BASE_HEALTH;
        this.kills = 0;
        this.initLevel();
        this.ui.showGameUI();
        this.state = GAME_STATE.PLAYING;
        this.startLoop();
    }

    initLevel() {
        this.map = new GameMap(this.level);
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];
        this.currentWave = 0;
        this.waveTimer = FIRST_WAVE_DELAY;
        this.waveState = 'between'; // 初始状态：等第一波
        this.spawnQueue = [];
        this.allSpawned = false;
        this.winDelay = 0;
        this.refreshCost = BASE_REFRESH_COST;
        this.selectedUnitIndex = -1;
        this.messageText = '';
        this.messageTimer = 0;

        this.unitPool = generateUnitPool();
        this.waves = generateWaveConfig(this.level);

        this.ui.updateStats(this.level, this.waves.length, this.currentWave, this.gold, this.health, this.maxHealth);
        this.ui.updateRefreshCost(this.refreshCost);
        this.ui.renderUnitPool(this.unitPool, this.gold);
        this.ui.setSelectedIndex(-1);
        this._lastGold = this.gold;

        // 第一波提示
        this.flashMessage(`第 1 波即将来袭（${FIRST_WAVE_DELAY}秒后）`);
    }

    nextLevel() {
        this.level++;
        const bonus = 80 + this.level * 30;
        this.gold += bonus;

        this.initLevel();
        this._lastGold = this.gold;
        this.ui.winScreen.classList.add('hidden');
        this.state = GAME_STATE.PLAYING;
        this.startLoop();
    }

    restartGame() {
        this.ui.loseScreen.classList.add('hidden');
        this.startGame();
    }

    togglePause() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
            this.ui.showPauseScreen(true);
            this.stopLoop();
        } else if (this.state === GAME_STATE.PAUSED) {
            this.state = GAME_STATE.PLAYING;
            this.ui.showPauseScreen(false);
            this.startLoop();
        }
    }

    quitToMenu() {
        this.stopLoop();
        this.state = GAME_STATE.MENU;
        this.ui.showPauseScreen(false);
        this.ui.showStartScreen();
        this.drawMenuBackground();
    }

    winLevel() {
        this.state = GAME_STATE.WIN;
        this.stopLoop();

        const best = this.getBestLevel();
        if (this.level > best) {
            this.setBestLevel(this.level);
        }

        const bonus = 80 + this.level * 30;
        this.ui.showWinScreen(this.level, bonus);
    }

    loseLevel() {
        this.state = GAME_STATE.LOSE;
        this.stopLoop();

        const best = this.getBestLevel();
        if (this.level > best) {
            this.setBestLevel(this.level);
        }

        this.ui.showLoseScreen(this.level, this.kills);
    }

    // ============ 兵种系统 ============

    selectUnit(index) {
        const unitData = this.unitPool[index];
        if (this.gold < unitData.hero.cost) {
            this.flashMessage('金币不足');
            return;
        }

        if (this.selectedUnitIndex === index) {
            console.log('[选中] 取消选中，当前索引:', index);
            this.selectedUnitIndex = -1;
            this.ui.setSelectedIndex(-1);
        } else {
            console.log('[选中] 选中武将:', unitData.hero.name, '索引:', index);
            this.selectedUnitIndex = index;
            this.ui.setSelectedIndex(index);
        }
    }

    refreshUnits() {
        if (this.gold < this.refreshCost) return;

        this.gold -= this.refreshCost;
        this.unitPool = generateUnitPool();
        this.selectedUnitIndex = -1;
        this.refreshCost = Math.floor(this.refreshCost * 1.3);
        this._lastGold = this.gold;

        this.ui.updateStats(this.level, this.timeLeft, this.gold, this.health, this.maxHealth);
        this.ui.updateRefreshCost(this.refreshCost);
        this.ui.renderUnitPool(this.unitPool, this.gold);
        this.ui.setSelectedIndex(-1);
    }

    // ============ 主循环 ============

    startLoop() {
        if (this.animationId) return;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    stopLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    loop(currentTime) {
        if (this.state !== GAME_STATE.PLAYING) {
            this.animationId = null;
            return;
        }

        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(dt);
        this.draw();

        this.animationId = requestAnimationFrame((t) => this.loop(t));
    }

    // ============ 更新逻辑 ============

    update(dt) {
        // 波次控制
        this.updateWaves(dt);
        this.updateSpawns(dt);

        // 更新敌人
        for (const enemy of this.enemies) {
            enemy.update(dt);

            if (enemy.reachedEnd && !enemy.counted) {
                enemy.counted = true;
                this.health -= enemy.damage;
                // 震动提示
                this.addEffect({
                    type: 'leak',
                    x: this.canvas.width - 20,
                    y: this.canvas.height / 2,
                    timer: 0.5,
                    maxTimer: 0.5,
                });
                if (this.health <= 0) {
                    this.health = 0;
                    this.loseLevel();
                    return;
                }
            }

            if (enemy.dead && !enemy.counted) {
                enemy.counted = true;
                this.gold += enemy.gold;
                this.kills++;
                this.addEffect({
                    type: 'death',
                    x: enemy.x,
                    y: enemy.y,
                    timer: 0.5,
                    maxTimer: 0.5,
                    color: enemy.accent,
                });
            }
        }

        this.enemies = this.enemies.filter(e => !e.dead && !e.reachedEnd);

        // 更新塔
        for (const tower of this.towers) {
            tower.update(dt, this.enemies, this.projectiles);
        }

        // 更新子弹
        for (const proj of this.projectiles) {
            proj.update(dt, this.enemies);
        }
        this.projectiles = this.projectiles.filter(p => !p.dead);

        // 更新特效
        for (const eff of this.effects) {
            eff.timer -= dt;
        }
        this.effects = this.effects.filter(e => e.timer > 0);

        // 消息
        if (this.messageTimer > 0) {
            this.messageTimer -= dt;
        }

        // 胜利判定：所有波次生成完毕 + 场上没有敌人 + spawnQueue 为空
        if (this.allSpawned && this.enemies.length === 0 && this.spawnQueue.length === 0) {
            this.winDelay -= dt;
            if (this.winDelay <= 0) {
                this.winLevel();
                return;
            }
        }

        // UI - 只更新数值和卡片状态，不重建DOM
        this.ui.updateStats(this.level, this.waves.length, this.currentWave, this.gold, this.health, this.maxHealth);
        if (this.gold !== this._lastGold) {
            this.ui.updateCardStates(this.unitPool, this.gold, this.selectedUnitIndex);
            this._lastGold = this.gold;
        }
    }

    updateWaves(dt) {
        // 全部波次已生成完毕
        if (this.currentWave >= this.waves.length) {
            if (!this.allSpawned && this.spawnQueue.length === 0) {
                this.allSpawned = true;
                this.waveState = 'all_done';
                this.winDelay = 1.5; // 延迟1.5秒再胜利
                console.log('[波次] 最后一波敌人全部生成，等待消灭');
            }
            return;
        }

        // 波次间隔倒计时
        if (this.waveState === 'between') {
            this.waveTimer -= dt;
            if (this.waveTimer <= 0) {
                // 开始这一波
                const wave = this.waves[this.currentWave];
                for (const spawn of wave.enemies) {
                    this.spawnQueue.push({
                        heroIdx: spawn.heroIdx,
                        levelMult: spawn.levelMult,
                        delay: spawn.spawnDelay,
                    });
                }
                this.currentWave++;
                this.waveState = 'spawning';
                this._waveAnnounced = false;
                console.log('[波次] 开始第', this.currentWave, '波');

                // 波次提示
                if (this.currentWave === this.waves.length) {
                    this.flashMessage('最终波次！');
                } else {
                    this.flashMessage(`第 ${this.currentWave} 波来袭！`);
                }
            }
        }

        // 检测本波是否生成完毕
        if (this.waveState === 'spawning' && this.spawnQueue.length === 0) {
            // 本波生成完了
            if (this.currentWave < this.waves.length) {
                // 还有下一波，进入间隔
                this.waveState = 'between';
                const interval = WAVE_INTERVAL_MIN + Math.random() * (WAVE_INTERVAL - WAVE_INTERVAL_MIN);
                this.waveTimer = interval;
                console.log('[波次] 本波生成完毕，下一波', interval.toFixed(1), '秒后开始');
                this.flashMessage(`下一波 ${Math.ceil(interval)} 秒后来袭`);
            } else {
                // 最后一波生成中，等 spawnQueue 清空后由上面的逻辑处理
                this.waveState = 'last_wave_spawning';
            }
        }

        // last_wave_spawning 状态等待 spawnQueue 清空
        if (this.waveState === 'last_wave_spawning' && this.spawnQueue.length === 0) {
            this.allSpawned = true;
            this.waveState = 'all_done';
            this.winDelay = 1.5;
            console.log('[波次] 最终波次全部生成，等待消灭');
        }
    }

    updateSpawns(dt) {
        for (const spawn of this.spawnQueue) {
            spawn.delay -= dt;
        }

        const ready = this.spawnQueue.filter(s => s.delay <= 0);
        this.spawnQueue = this.spawnQueue.filter(s => s.delay > 0);

        for (const spawn of ready) {
            const heroData = ENEMY_HEROES[spawn.heroIdx];
            const enemy = new Enemy(heroData, this.map, spawn.levelMult);
            this.enemies.push(enemy);
        }
    }

    addEffect(effect) {
        this.effects.push(effect);
    }

    // ============ 绘制 ============

    draw() {
        const ctx = this.ctx;

        ctx.fillStyle = '#1a1210';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.map) {
            this.map.draw(ctx);
        }

        // 部署预览
        if (this.selectedUnitIndex >= 0 && this.map && this.state === GAME_STATE.PLAYING) {
            this.drawPlacementPreview(ctx);
        }

        for (const tower of this.towers) {
            tower.draw(ctx, false);
        }

        for (const enemy of this.enemies) {
            enemy.draw(ctx);
        }

        for (const proj of this.projectiles) {
            proj.draw(ctx);
        }

        this.drawEffects(ctx);
        this.drawWaveInfo(ctx);
        this.drawMessage(ctx);
    }

    drawPlacementPreview(ctx) {
        const grid = this.hoverGrid;
        if (grid.x < 0 || grid.y < 0) return;
        if (grid.x >= this.map.cols || grid.y >= this.map.rows) return;

        const onGrass = this.map.canPlaceAt(grid.x, grid.y);
        const noTower = !this.towers.find(t => t.gridX === grid.x && t.gridY === grid.y);
        const canPlace = onGrass && noTower;

        const unitData = this.unitPool[this.selectedUnitIndex];
        const pos = this.map.gridToPixel(grid.x, grid.y);

        // 范围圈
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, unitData.hero.range, 0, Math.PI * 2);
        ctx.fillStyle = canPlace ? 'rgba(240, 216, 144, 0.08)' : 'rgba(212, 48, 48, 0.12)';
        ctx.fill();
        ctx.strokeStyle = canPlace ? 'rgba(240, 216, 144, 0.6)' : 'rgba(212, 48, 48, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 格子高亮
        const px = grid.x * this.map.tileSize;
        const py = grid.y * this.map.tileSize + this.map.offsetY;
        ctx.fillStyle = canPlace ? 'rgba(240, 216, 144, 0.25)' : 'rgba(212, 48, 48, 0.25)';
        ctx.fillRect(px, py, this.map.tileSize, this.map.tileSize);
        ctx.strokeStyle = canPlace ? '#f0d890' : '#d43030';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 0.5, py + 0.5, this.map.tileSize - 1, this.map.tileSize - 1);

        // 半透明预览武将
        if (canPlace) {
            ctx.globalAlpha = 0.5;
            const s = 26;
            ctx.fillStyle = unitData.hero.color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, s / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = unitData.hero.accent;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y - 5, s / 3, Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px "KaiTi", "STKaiti", serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(unitData.hero.name, pos.x, pos.y + 1);
            ctx.globalAlpha = 1;
        }
    }

    drawEffects(ctx) {
        for (const eff of this.effects) {
            const t = eff.timer / eff.maxTimer;
            const alpha = t;

            if (eff.type === 'place') {
                const radius = 26 * (1 - t) + 8;
                ctx.beginPath();
                ctx.arc(eff.x, eff.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = eff.color;
                ctx.globalAlpha = alpha;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.globalAlpha = 1;
            } else if (eff.type === 'death') {
                const radius = 18 * (1 - t) + 4;
                ctx.beginPath();
                ctx.arc(eff.x, eff.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = eff.color;
                ctx.globalAlpha = alpha * 0.6;
                ctx.fill();
                ctx.globalAlpha = 1;
            } else if (eff.type === 'place_fail') {
                ctx.strokeStyle = '#d43030';
                ctx.globalAlpha = alpha;
                ctx.lineWidth = 3;
                const r = 14;
                ctx.beginPath();
                ctx.arc(eff.x, eff.y, r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(eff.x - r * 0.6, eff.y - r * 0.6);
                ctx.lineTo(eff.x + r * 0.6, eff.y + r * 0.6);
                ctx.moveTo(eff.x + r * 0.6, eff.y - r * 0.6);
                ctx.lineTo(eff.x - r * 0.6, eff.y + r * 0.6);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }

    drawWaveInfo(ctx) {
        if (!this.waves || this.waves.length === 0) return;

        const waveNum = Math.min(this.currentWave, this.waves.length);
        const total = this.waves.length;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.canvas.width / 2 - 55, 8, 110, 24);
        ctx.fillStyle = '#f0d890';
        ctx.font = '13px "KaiTi", "STKaiti", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`第 ${waveNum} / ${total} 波`, this.canvas.width / 2, 20);
    }

    drawMessage(ctx) {
        if (!this.messageText || this.messageTimer <= 0) return;
        const alpha = Math.min(1, this.messageTimer / 0.3);
        const yOffset = (1.2 - this.messageTimer) * 8;

        ctx.globalAlpha = alpha;
        const text = this.messageText;
        ctx.font = 'bold 15px "KaiTi", "STKaiti", serif';
        const textWidth = ctx.measureText(text).width;
        const boxWidth = textWidth + 28;
        const boxX = this.canvas.width / 2 - boxWidth / 2;
        const boxY = 44 - yOffset;

        ctx.fillStyle = 'rgba(139, 26, 26, 0.92)';
        ctx.fillRect(boxX, boxY, boxWidth, 28);
        ctx.strokeStyle = '#c83030';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(boxX, boxY, boxWidth, 28);

        ctx.fillStyle = '#f0d890';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, this.canvas.width / 2, boxY + 14);
        ctx.globalAlpha = 1;
    }

    drawMenuBackground() {
        const ctx = this.ctx;
        ctx.fillStyle = '#1a1210';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 远山
        ctx.fillStyle = '#2a1f18';
        ctx.beginPath();
        ctx.moveTo(0, 320);
        for (let x = 0; x <= this.canvas.width; x += 40) {
            const y = 300 + Math.sin(x * 0.02) * 25 + Math.sin(x * 0.05) * 12;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(this.canvas.width, 480);
        ctx.lineTo(0, 480);
        ctx.closePath();
        ctx.fill();

        // 近山
        ctx.fillStyle = '#35241a';
        ctx.beginPath();
        ctx.moveTo(0, 400);
        for (let x = 0; x <= this.canvas.width; x += 30) {
            const y = 390 + Math.sin(x * 0.03 + 1) * 18 + Math.sin(x * 0.07) * 8;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(this.canvas.width, 480);
        ctx.lineTo(0, 480);
        ctx.closePath();
        ctx.fill();

        // 战旗
        ctx.fillStyle = '#5a1010';
        ctx.fillRect(120, 280, 4, 90);
        ctx.fillStyle = '#c82020';
        ctx.beginPath();
        ctx.moveTo(124, 280);
        ctx.lineTo(170, 300);
        ctx.lineTo(124, 320);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#5a1010';
        ctx.fillRect(780, 250, 4, 120);
        ctx.fillStyle = '#c82020';
        ctx.beginPath();
        ctx.moveTo(784, 250);
        ctx.lineTo(830, 270);
        ctx.lineTo(784, 290);
        ctx.closePath();
        ctx.fill();

        // 背景大字
        ctx.fillStyle = 'rgba(240, 216, 144, 0.05)';
        ctx.font = 'bold 180px "KaiTi", "STKaiti", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('趙', this.canvas.width / 2, this.canvas.height / 2 + 10);
    }

    // ============ 最高分 ============

    getBestLevel() {
        try {
            return parseInt(localStorage.getItem('zhaoyun_best_level') || '0', 10);
        } catch (e) {
            return 0;
        }
    }

    setBestLevel(level) {
        try {
            localStorage.setItem('zhaoyun_best_level', level.toString());
        } catch (e) {
            // 忽略
        }
    }
}

// 启动
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
