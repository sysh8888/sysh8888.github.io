/* 敌人系统
 * 敌军武将数据与 Enemy 类
 */

// 敌军武将数据
const ENEMY_HEROES = [
    // 普通步兵 - 慢
    { name: '曹军', health: 50, speed: 0.0085, damage: 8, gold: 8, color: '#5a7a3a', accent: '#8b4513', size: 13 },
    { name: '曹兵', health: 40, speed: 0.0095, damage: 6, gold: 6, color: '#6a8a4a', accent: '#6b3410', size: 11 },
    // 普通武将 - 中等速度
    { name: '于禁', health: 85, speed: 0.009, damage: 12, gold: 15, color: '#4a6a8a', accent: '#c0c0c0', size: 15 },
    { name: '乐进', health: 70, speed: 0.0095, damage: 10, gold: 13, color: '#7a5a3a', accent: '#d4a060', size: 14 },
    { name: '张郃', health: 110, speed: 0.0095, damage: 15, gold: 20, color: '#5a6a8a', accent: '#e0e0e0', size: 16 },
    { name: '徐晃', health: 95, speed: 0.0092, damage: 13, gold: 18, color: '#8b4513', accent: '#c89030', size: 15 },
    { name: '李典', health: 75, speed: 0.0098, damage: 11, gold: 14, color: '#3a5a7a', accent: '#b0b0b0', size: 14 },
    // 精英武将
    { name: '曹仁', health: 220, speed: 0.008, damage: 22, gold: 40, color: '#8b1a1a', accent: '#ffd700', size: 19 },
    { name: '夏侯惇', health: 260, speed: 0.0085, damage: 26, gold: 50, color: '#6b2a2a', accent: '#e0e0e0', size: 20 },
    // Boss 曹操
    { name: '曹操', health: 700, speed: 0.008, damage: 50, gold: 120, color: '#2a1a3a', accent: '#ffd700', size: 25 },
];

class Enemy {
    constructor(heroData, map, levelMultiplier = 1) {
        this.hero = heroData;
        this.map = map;
        this.name = heroData.name;

        // 应用关卡难度倍率
        this.maxHealth = Math.floor(heroData.health * levelMultiplier);
        this.health = this.maxHealth;
        this.speed = heroData.speed * (1 + (levelMultiplier - 1) * 0.3); // 速度增长慢一些
        this.damage = Math.floor(heroData.damage * levelMultiplier);
        this.gold = Math.floor(heroData.gold * (1 + (levelMultiplier - 1) * 0.5));
        this.color = heroData.color;
        this.accent = heroData.accent;
        this.size = heroData.size;

        this.progress = 0; // 0~1，路径进度
        this.dead = false;
        this.reachedEnd = false;

        const startPos = map.getPositionOnPath(0);
        this.x = startPos.x;
        this.y = startPos.y;

        this.hitFlash = 0;
        this.walkPhase = Math.random() * Math.PI * 2;
    }

    update(dt) {
        if (this.dead || this.reachedEnd) return;

        // 沿路径移动
        this.progress += this.speed * dt;
        this.walkPhase += dt * 8;

        if (this.progress >= 1) {
            this.progress = 1;
            this.reachedEnd = true;
            return;
        }

        const pos = this.map.getPositionOnPath(this.progress);
        this.x = pos.x;
        this.y = pos.y;

        if (this.hitFlash > 0) this.hitFlash -= dt;
    }

    takeDamage(damage) {
        if (this.dead) return;
        this.health -= damage;
        this.hitFlash = 0.1;
        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
        }
    }

    draw(ctx) {
        if (this.dead) return;

        const s = this.size;
        const bobOffset = Math.sin(this.walkPhase) * 2;

        // 影子
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + s * 0.6, s * 0.6, s * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // 身体
        const bodyY = this.y + bobOffset;
        ctx.fillStyle = this.hitFlash > 0 ? '#fff' : this.color;
        ctx.beginPath();
        ctx.arc(this.x, bodyY, s * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // 头盔/头饰
        ctx.fillStyle = this.hitFlash > 0 ? '#fff' : this.accent;
        ctx.beginPath();
        ctx.arc(this.x, bodyY - s * 0.2, s * 0.5, Math.PI, Math.PI * 2);
        ctx.fill();

        // 敌人标识（曹军的"曹"或武将缩写）
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.floor(s * 0.5)}px "KaiTi", "STKaiti", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = this.name.length > 1 ? this.name.charAt(0) : this.name;
        ctx.fillText(label, this.x, bodyY + 1);

        // 血条
        const barWidth = s * 1.6;
        const barHeight = 3;
        const barX = this.x - barWidth / 2;
        const barY = this.y - s - 6;
        ctx.fillStyle = '#3a1a1a';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        const hpRatio = this.health / this.maxHealth;
        ctx.fillStyle = hpRatio > 0.5 ? '#4a9a4a' : (hpRatio > 0.25 ? '#e0a030' : '#d43030');
        ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
    }
}

// 根据关卡生成波次配置
function generateWaveConfig(level) {
    const waves = [];
    // 第1关6波，每关+1波，最高12波
    const waveCount = Math.min(12, 5 + level);
    const levelMult = 1 + (level - 1) * 0.5; // 难度倍率 - 每关+50%血量

    for (let w = 0; w < waveCount; w++) {
        const wave = {
            // delay 字段保留但在波次制中不再使用（用全局 WAVE_INTERVAL）
            delay: 5,
            enemies: [],
        };

        const baseEnemies = 5 + w * 2 + level * 2; // 每波敌人数量

        for (let i = 0; i < baseEnemies; i++) {
            let enemyIdx;
            const rand = Math.random();

            if (w === waveCount - 1 && i === baseEnemies - 1) {
                // 最后一波最后一个是Boss
                enemyIdx = 9; // 曹操
            } else if (w === waveCount - 1 && i >= baseEnemies - 3) {
                // 最后一波末尾几个是精英
                enemyIdx = 7 + Math.floor(Math.random() * 2); // 7-8
            } else if (rand < 0.4) {
                // 普通兵
                enemyIdx = Math.random() < 0.5 ? 0 : 1;
            } else if (rand < 0.8) {
                // 普通武将
                enemyIdx = 2 + Math.floor(Math.random() * 5); // 2-6
            } else {
                // 精英武将
                enemyIdx = 7 + Math.floor(Math.random() * 2); // 7-8
            }

            wave.enemies.push({
                heroIdx: enemyIdx,
                spawnDelay: i * (0.5 + Math.random() * 0.3),
                levelMult: levelMult * (1 + w * 0.15), // 越往后越难，每波+15%
            });
        }

        waves.push(wave);
    }

    return waves;
}
