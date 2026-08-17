/* 兵种系统
 * 包含武将数据定义、Tower 类（防御单位）、Projectile 类（子弹）
 */

// 武将数据库 - 按兵种类型分类
const HEROES = {
    // 骑兵 - 高攻击、近中距离、攻速快
    cavalry: [
        { name: '关羽', damage: 30, range: 100, attackSpeed: 0.7, health: 120, cost: 90, color: '#e0e0e0', accent: '#4a90d9', icon: '⚔' },
        { name: '马超', damage: 26, range: 90, attackSpeed: 0.8, health: 110, cost: 85, color: '#f0d080', accent: '#c04040', icon: '⚔' },
        { name: '张飞', damage: 29, range: 95, attackSpeed: 0.75, health: 130, cost: 90, color: '#c0c0c0', accent: '#6a5a9a', icon: '⚔' },
        { name: '马岱', damage: 24, range: 85, attackSpeed: 0.85, health: 140, cost: 80, color: '#8b4513', accent: '#2a2a2a', icon: '⚔' },
    ],
    // 弓箭手 - 远程、中等伤害、中等攻速
    archer: [
        { name: '黄忠', damage: 28, range: 180, attackSpeed: 1.0, health: 70, cost: 100, color: '#d4a060', accent: '#8b4513', icon: '🏹' },
        { name: '姜维', damage: 21, range: 160, attackSpeed: 1.2, health: 90, cost: 90, color: '#c03030', accent: '#ffd700', icon: '🏹' },
        { name: '严颜', damage: 20, range: 170, attackSpeed: 1.1, health: 75, cost: 85, color: '#5a8ba0', accent: '#c0c0c0', icon: '🏹' },
        { name: '王平', damage: 18, range: 190, attackSpeed: 1.1, health: 65, cost: 75, color: '#6a4a8a', accent: '#d0d0d0', icon: '🏹' },
    ],
    // 刀兵 - 高血量、近战、肉盾
    infantry: [
        { name: '魏延', damage: 25, range: 60, attackSpeed: 0.8, health: 200, cost: 80, color: '#1a1a1a', accent: '#c03030', icon: '🗡' },
        { name: '周仓', damage: 24, range: 70, attackSpeed: 0.9, health: 180, cost: 70, color: '#3a6a3a', accent: '#c89030', icon: '🗡' },
        { name: '关平', damage: 22, range: 55, attackSpeed: 0.8, health: 250, cost: 65, color: '#6a4a2a', accent: '#8b4513', icon: '🗡' },
        { name: '‌廖化', damage: 20, range: 60, attackSpeed: 0.85, health: 220, cost: 60, color: '#4a2a1a', accent: '#d4a060', icon: '🗡' },
    ],
    // 谋士 - 法术AOE、中距离、伤害高、攻速慢
    strategist: [
        { name: '诸葛亮', damage: 40, range: 150, attackSpeed: 1.6, health: 60, cost: 120, color: '#f0e0d0', accent: '#2a5a8b', aoe: true, aoeRadius: 50, icon: '✨' },
        { name: '庞统', damage: 35, range: 140, attackSpeed: 1.5, health: 65, cost: 110, color: '#4a4a6a', accent: '#8b8bc0', aoe: true, aoeRadius: 45, icon: '✨' },
        { name: '法正', damage: 32, range: 145, attackSpeed: 1.4, health: 55, cost: 105, color: '#d0c0a0', accent: '#5a7a9a', aoe: true, aoeRadius: 48, icon: '✨' },
        { name: '马良', damage: 30, range: 135, attackSpeed: 1.6, health: 58, cost: 100, color: '#c03030', accent: '#ffd700', aoe: true, aoeRadius: 55, icon: '✨' },
    ],
    // 枪兵 - 中等距离、高穿透
    spearman: [
        { name: '赵云*', damage: 35, range: 110, attackSpeed: 0.8, health: 150, cost: 95, color: '#e8e8e8', accent: '#4a90d9', icon: '🔱' },
        { name: '张苞*', damage: 28, range: 100, attackSpeed: 0.9, health: 140, cost: 90, color: '#f0d080', accent: '#c04040', icon: '🔱' },
        { name: '关兴', damage: 26, range: 105, attackSpeed: 0.85, health: 160, cost: 85, color: '#5a6a8a', accent: '#c0c0c0', icon: '🔱' },
        { name: '张任', damage: 24, range: 95, attackSpeed: 0.9, health: 170, cost: 80, color: '#6a3a2a', accent: '#c89030', icon: '🔱' },
    ],
};

// 兵种类型中文名
const UNIT_TYPE_NAMES = {
    cavalry: '骑兵',
    archer: '弓手',
    infantry: '刀兵',
    strategist: '谋士',
    spearman: '枪兵',
};

// 防御塔（部署的武将）
class Tower {
    constructor(hero, type, gridX, gridY, map) {
        this.hero = hero;
        this.type = type;
        this.name = hero.name;
        this.gridX = gridX;
        this.gridY = gridY;
        this.map = map;

        const pos = map.gridToPixel(gridX, gridY);
        this.x = pos.x;
        this.y = pos.y;

        this.damage = hero.damage;
        this.range = hero.range;
        this.attackSpeed = hero.attackSpeed; // 每次攻击间隔（秒）
        this.maxHealth = hero.health;
        this.health = hero.health;
        this.cost = hero.cost;
        this.color = hero.color;
        this.accent = hero.accent;
        this.icon = hero.icon;
        this.aoe = hero.aoe || false;
        this.aoeRadius = hero.aoeRadius || 0;

        this.attackCooldown = 0;
        this.target = null;
        this.attackAnimTimer = 0;
    }

    update(dt, enemies, projectiles) {
        this.attackCooldown -= dt;
        if (this.attackAnimTimer > 0) this.attackAnimTimer -= dt;

        // 寻找目标
        if (!this.target || this.target.dead || !this.inRange(this.target)) {
            this.target = this.findTarget(enemies);
        }

        // 攻击
        if (this.target && this.attackCooldown <= 0) {
            this.attack(this.target, projectiles);
            this.attackCooldown = this.attackSpeed;
            this.attackAnimTimer = 0.15;
        }
    }

    inRange(enemy) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        return dx * dx + dy * dy <= this.range * this.range;
    }

    findTarget(enemies) {
        // 优先攻击路径上最靠前的敌人（离终点最近的）
        let best = null;
        let bestProgress = -1;

        for (const enemy of enemies) {
            if (enemy.dead) continue;
            if (!this.inRange(enemy)) continue;
            if (enemy.progress > bestProgress) {
                bestProgress = enemy.progress;
                best = enemy;
            }
        }

        return best;
    }

    attack(target, projectiles) {
        const proj = new Projectile({
            x: this.x,
            y: this.y,
            target: target,
            damage: this.damage,
            speed: 400,
            color: this.accent,
            aoe: this.aoe,
            aoeRadius: this.aoeRadius,
            type: this.type,
        });
        projectiles.push(proj);
    }

    draw(ctx, isSelected) {
        const size = 30;

        // 攻击范围（选中时显示）
        if (isSelected) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(240, 216, 144, 0.1)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(240, 216, 144, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 底座
        ctx.fillStyle = this.accent;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 12, size / 2 + 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 14, size / 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 身体
        const bodyY = this.attackAnimTimer > 0 ? this.y - 2 : this.y;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, bodyY, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // 头部装饰/头盔
        ctx.fillStyle = this.accent;
        ctx.beginPath();
        ctx.arc(this.x, bodyY - 6, size / 3, Math.PI, Math.PI * 2);
        ctx.fill();

        // 名字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "KaiTi", "STKaiti", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.x, bodyY + 1);

        // 血条
        const barWidth = 28;
        const barHeight = 3;
        const barX = this.x - barWidth / 2;
        const barY = this.y + 16;
        ctx.fillStyle = '#3a1a1a';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = this.health / this.maxHealth > 0.3 ? '#4a9a4a' : '#d43030';
        ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
    }
}

// 子弹/抛射物
class Projectile {
    constructor(opts) {
        this.x = opts.x;
        this.y = opts.y;
        this.target = opts.target;
        this.damage = opts.damage;
        this.speed = opts.speed;
        this.color = opts.color;
        this.aoe = opts.aoe;
        this.aoeRadius = opts.aoeRadius;
        this.type = opts.type;
        this.dead = false;
    }

    update(dt, enemies) {
        if (this.dead) return;
        if (!this.target || this.target.dead) {
            this.dead = true;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 8) {
            // 命中
            this.dead = true;
            this.onHit(enemies);
            return;
        }

        const vx = (dx / dist) * this.speed * dt;
        const vy = (dy / dist) * this.speed * dt;
        this.x += vx;
        this.y += vy;
    }

    onHit(enemies) {
        if (this.aoe) {
            // AOE 伤害
            for (const enemy of enemies) {
                if (enemy.dead) continue;
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                if (dx * dx + dy * dy <= this.aoeRadius * this.aoeRadius) {
                    enemy.takeDamage(this.damage);
                }
            }
        } else {
            this.target.takeDamage(this.damage);
        }
    }

    draw(ctx) {
        if (this.dead) return;

        if (this.aoe) {
            // 法术弹 - 发光小球
            ctx.beginPath();
            ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (this.type === 'archer') {
            // 箭矢
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const angle = Math.atan2(dy, dx);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-8, -1, 14, 2);
            ctx.fillStyle = '#c0c0c0';
            ctx.beginPath();
            ctx.moveTo(6, 0);
            ctx.lineTo(2, -3);
            ctx.lineTo(2, 3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } else {
            // 近战光效/普通子弹
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
}

// 抽取随机武将池（4个）
function generateUnitPool() {
    const pool = [];
    const types = ['cavalry', 'archer', 'infantry', 'strategist'];
    // 随机选4种类型各一个，或者有概率重复
    const shuffled = [...types].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 4; i++) {
        const type = shuffled[i % shuffled.length];
        const heroList = HEROES[type];
        const hero = heroList[Math.floor(Math.random() * heroList.length)];
        pool.push({
            hero,
            type,
            typeName: UNIT_TYPE_NAMES[type],
        });
    }
    return pool;
}
