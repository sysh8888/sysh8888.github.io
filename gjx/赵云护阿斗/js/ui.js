/* UI 管理 */

class UIManager {
    constructor(game) {
        this.game = game;

        this.startScreen = document.getElementById('start-screen');
        this.winScreen = document.getElementById('win-screen');
        this.loseScreen = document.getElementById('lose-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.topBar = document.getElementById('top-bar');
        this.unitPanel = document.getElementById('unit-panel');

        this.levelDisplay = document.getElementById('level-display');
        this.waveDisplay = document.getElementById('wave-display');
        this.goldDisplay = document.getElementById('gold-display');
        this.healthBar = document.getElementById('health-bar');
        this.healthText = document.getElementById('health-text');
        this.unitSlots = document.getElementById('unit-slots');
        this.refreshCost = document.getElementById('refresh-cost');
        this.bestLevel = document.getElementById('best-level');

        document.getElementById('start-btn').addEventListener('click', () => this.game.startGame());
        document.getElementById('next-level-btn').addEventListener('click', () => this.game.nextLevel());
        document.getElementById('restart-btn').addEventListener('click', () => this.game.restartGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.game.togglePause());
        document.getElementById('resume-btn').addEventListener('click', () => this.game.togglePause());
        document.getElementById('quit-btn').addEventListener('click', () => this.game.quitToMenu());
        document.getElementById('refresh-btn').addEventListener('click', () => this.game.refreshUnits());

        this.selectedIndex = -1;
    }

    init() {
        const best = this.game.getBestLevel();
        this.bestLevel.textContent = best;
    }

    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.winScreen.classList.add('hidden');
        this.loseScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.topBar.classList.add('hidden');
        this.unitPanel.classList.add('hidden');

        const best = this.game.getBestLevel();
        this.bestLevel.textContent = best;
    }

    showGameUI() {
        this.startScreen.classList.add('hidden');
        this.winScreen.classList.add('hidden');
        this.loseScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.topBar.classList.remove('hidden');
        this.unitPanel.classList.remove('hidden');
    }

    showWinScreen(level, bonus) {
        this.winScreen.classList.remove('hidden');
        document.getElementById('win-level').textContent = level;
        document.getElementById('win-bonus').textContent = bonus;
    }

    showLoseScreen(level, kills) {
        this.loseScreen.classList.remove('hidden');
        document.getElementById('lose-level').textContent = level;
        document.getElementById('lose-kills').textContent = kills;
    }

    showPauseScreen(show) {
        if (show) {
            this.pauseScreen.classList.remove('hidden');
        } else {
            this.pauseScreen.classList.add('hidden');
        }
    }

    updateStats(level, totalWaves, currentWave, gold, health, maxHealth) {
        this.levelDisplay.textContent = level;
        this.waveDisplay.textContent = `${currentWave} / ${totalWaves}`;
        this.goldDisplay.textContent = gold;

        const hpRatio = Math.max(0, health / maxHealth);
        this.healthBar.style.width = (hpRatio * 100) + '%';
        this.healthText.textContent = `${Math.ceil(health)}/${maxHealth}`;
    }

    updateRefreshCost(cost) {
        this.refreshCost.textContent = cost + '金';
    }

    renderUnitPool(pool, gold) {
        console.log('[UI] 渲染武将卡池，数量:', pool.length);
        this.unitSlots.innerHTML = '';

        pool.forEach((unit, index) => {
            const card = document.createElement('div');
            card.className = 'unit-card';
            card.dataset.index = index;
            if (gold < unit.hero.cost) {
                card.classList.add('disabled');
            }
            if (index === this.selectedIndex) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <span class="unit-type-tag">${unit.typeName}</span>
                <div class="unit-icon">${unit.hero.icon}</div>
                <div class="unit-name">${unit.hero.name}</div>
                <span class="unit-cost">${unit.hero.cost}金</span>
            `;

            card.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('[UI] 点击武将卡片，索引:', index, '名称:', unit.hero.name);
                if (gold < unit.hero.cost) {
                    console.log('[UI] 金币不足，忽略点击');
                    return;
                }
                this.game.selectUnit(index);
            });

            card.title = `${unit.hero.name}（${unit.typeName}）\n攻击：${unit.hero.damage}  射程：${unit.hero.range}\n攻速：${unit.hero.attackSpeed}s  血量：${unit.hero.health}\n${unit.hero.aoe ? '范围伤害' : '单体伤害'}`;

            this.unitSlots.appendChild(card);
        });
    }

    // 只更新卡片的选中/禁用状态，不重建DOM（保留事件监听）
    updateCardStates(pool, gold, selectedIndex) {
        const cards = this.unitSlots.querySelectorAll('.unit-card');
        cards.forEach((card, i) => {
            const unit = pool[i];
            if (!unit) return;

            if (gold < unit.hero.cost) {
                card.classList.add('disabled');
            } else {
                card.classList.remove('disabled');
            }

            if (i === selectedIndex) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    setSelectedIndex(index) {
        this.selectedIndex = index;
        const cards = this.unitSlots.querySelectorAll('.unit-card');
        cards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }
}
