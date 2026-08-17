/* 地图系统 - 固定蜿蜒蛇形路径
 * 画布尺寸：960 x 480
 * 瓦片大小：32
 * 列数：30，行数：15
 */

const TILE_SIZE = 32;
const MAP_COLS = 30;
const MAP_ROWS = 15;
const MAP_OFFSET_Y = 0; // 画布从 0 开始（顶部栏不在画布内）

// 瓦片类型
const TILE = {
    GRASS: 0,    // 可部署的草地
    PATH: 1,     // 敌人行走路径
    START: 2,    // 敌人出生点
    END: 3,      // 阿斗位置（终点）
    ROCK: 4,     // 障碍，不可部署
};

class GameMap {
    constructor(level) {
        this.cols = MAP_COLS;
        this.rows = MAP_ROWS;
        this.tileSize = TILE_SIZE;
        this.offsetY = MAP_OFFSET_Y;
        this.tiles = [];
        this.path = [];

        this.generate();
    }

    generate() {
        // 初始化全草地
        for (let y = 0; y < this.rows; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.tiles[y][x] = TILE.GRASS;
            }
        }

        // 生成固定的蜿蜒蛇形路径
        this.path = this.buildSnakePath();

        // 标记路径瓦片
        for (let i = 0; i < this.path.length; i++) {
            const p = this.path[i];
            this.tiles[p.y][p.x] = TILE.PATH;
        }

        // 设置起点和终点
        this.startPos = this.path[0];
        this.endPos = this.path[this.path.length - 1];
        this.tiles[this.startPos.y][this.startPos.x] = TILE.START;
        this.tiles[this.endPos.y][this.endPos.x] = TILE.END;

        // 放一些石头装饰（不在路径上）
        this.placeRocks();
    }

    // 构建固定的蜿蜒蛇形路径
    // 从左侧开始，上下上下折返，共5次大折返，充分利用地图高度
    buildSnakePath() {
        const path = [];
        let x = 0;
        let y = 2;  // 起点在第2行
        const topBound = 1;
        const bottomBound = this.rows - 2; // 13

        // 工具函数：添加点
        const add = (px, py) => path.push({ x: px, y: py });

        add(x, y);

        // === 第1段：向下走到底部 ===
        while (y < bottomBound - 1) {
            y++;
            add(x, y);
        }

        // 水平推进到第5列
        while (x < 5) {
            x++;
            add(x, y);
        }

        // === 第2段：向上走到顶部 ===
        while (y > topBound + 1) {
            y--;
            add(x, y);
        }

        // 水平推进到第10列
        while (x < 10) {
            x++;
            add(x, y);
        }

        // === 第3段：向下走到底部 ===
        while (y < bottomBound - 1) {
            y++;
            add(x, y);
        }

        // 水平推进到第15列
        while (x < 15) {
            x++;
            add(x, y);
        }

        // === 第4段：向上走到顶部 ===
        while (y > topBound + 1) {
            y--;
            add(x, y);
        }

        // 水平推进到第20列
        while (x < 20) {
            x++;
            add(x, y);
        }

        // === 第5段：向下走到底部 ===
        while (y < bottomBound - 1) {
            y++;
            add(x, y);
        }

        // 水平推进到第25列
        while (x < 25) {
            x++;
            add(x, y);
        }

        // === 第6段：向上走到中间位置 ===
        const midY = Math.floor(this.rows / 2);
        while (y > midY) {
            y--;
            add(x, y);
        }

        // 最后走到终点（最右列）
        while (x < this.cols - 1) {
            x++;
            add(x, y);
        }

        return path;
    }

    placeRocks() {
        // 在固定位置放几块石头做装饰，不影响可玩性
        const rocks = [
            [3, 0], [7, 0], [12, 0], [18, 0], [23, 0], [27, 0],
            [3, 14], [8, 14], [13, 14], [19, 14], [24, 14], [28, 14],
            [1, 7], [28, 7],
        ];
        for (const [rx, ry] of rocks) {
            if (this.tiles[ry][rx] === TILE.GRASS) {
                this.tiles[ry][rx] = TILE.ROCK;
            }
        }
    }

    // 获取路径上某个进度（0~1）的像素位置
    getPositionOnPath(progress) {
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;

        const totalSteps = this.path.length - 1;
        const exactIndex = progress * totalSteps;
        const idx = Math.floor(exactIndex);
        const t = exactIndex - idx;

        if (idx >= this.path.length - 1) {
            const last = this.path[this.path.length - 1];
            return {
                x: last.x * this.tileSize + this.tileSize / 2,
                y: last.y * this.tileSize + this.tileSize / 2 + this.offsetY,
            };
        }

        const p1 = this.path[idx];
        const p2 = this.path[idx + 1];

        return {
            x: (p1.x + (p2.x - p1.x) * t) * this.tileSize + this.tileSize / 2,
            y: (p1.y + (p2.y - p1.y) * t) * this.tileSize + this.tileSize / 2 + this.offsetY,
        };
    }

    // 总路径长度（以步数计）
    getPathLength() {
        return this.path.length - 1;
    }

    // 判断某格是否可以部署兵种
    canPlaceAt(gridX, gridY) {
        if (gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) return false;
        return this.tiles[gridY][gridX] === TILE.GRASS;
    }

    // 像素坐标转网格坐标
    pixelToGrid(px, py) {
        return {
            x: Math.floor(px / this.tileSize),
            y: Math.floor((py - this.offsetY) / this.tileSize),
        };
    }

    // 网格坐标转像素坐标（中心）
    gridToPixel(gx, gy) {
        return {
            x: gx * this.tileSize + this.tileSize / 2,
            y: gy * this.tileSize + this.tileSize / 2 + this.offsetY,
        };
    }

    draw(ctx) {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const tile = this.tiles[y][x];
                const px = x * this.tileSize;
                const py = y * this.tileSize + this.offsetY;

                if (tile === TILE.GRASS) {
                    // 草地 - 斑驳纹理
                    const shade = (x + y) % 2 === 0 ? '#3a5a2a' : '#335226';
                    ctx.fillStyle = shade;
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    if ((x * 7 + y * 13) % 6 === 0) {
                        ctx.fillStyle = '#4a6a36';
                        ctx.fillRect(px + 6, py + 10, 2, 3);
                        ctx.fillRect(px + 18, py + 22, 2, 3);
                    }
                } else if (tile === TILE.PATH) {
                    // 路径 - 土黄色
                    ctx.fillStyle = '#8b6f47';
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    // 纹理
                    ctx.fillStyle = '#7a5e37';
                    ctx.fillRect(px + 3, py + 6, 3, 3);
                    ctx.fillRect(px + 16, py + 18, 3, 2);
                    ctx.fillRect(px + 24, py + 8, 2, 2);
                    ctx.strokeStyle = '#6b4e30';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(px, py, this.tileSize, this.tileSize);
                } else if (tile === TILE.START) {
                    // 出生点 - 红色战旗
                    ctx.fillStyle = '#8b6f47';
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#5a1010';
                    ctx.fillRect(px + 14, py + 4, 2, 22);
                    ctx.fillStyle = '#c82020';
                    ctx.beginPath();
                    ctx.moveTo(px + 16, py + 4);
                    ctx.lineTo(px + 27, py + 10);
                    ctx.lineTo(px + 16, py + 16);
                    ctx.closePath();
                    ctx.fill();
                } else if (tile === TILE.END) {
                    // 终点 - 阿斗的营帐
                    ctx.fillStyle = '#8b6f47';
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#d4b060';
                    ctx.fillRect(px + 6, py + 18, 20, 11);
                    ctx.fillStyle = '#2a5a8b';
                    ctx.beginPath();
                    ctx.moveTo(px + 2, py + 18);
                    ctx.lineTo(px + 16, py + 2);
                    ctx.lineTo(px + 30, py + 18);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#ffd700';
                    ctx.beginPath();
                    ctx.arc(px + 16, py + 2, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                } else if (tile === TILE.ROCK) {
                    // 石头
                    ctx.fillStyle = '#3a5a2a';
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#6a6a6a';
                    ctx.beginPath();
                    ctx.ellipse(px + this.tileSize / 2, py + this.tileSize / 2 + 3, 11, 8, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#8a8a8a';
                    ctx.beginPath();
                    ctx.ellipse(px + this.tileSize / 2 - 2, py + this.tileSize / 2 - 1, 10, 6, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
}
