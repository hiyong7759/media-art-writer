export class SolidMode {
    constructor(engine) {
        this.engine = engine;
        this.cubes = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.cubes = [{ x: this.engine.width / 2, y: this.engine.height / 2, size: 120, rx: 0, ry: 0 }];
    }

    draw() {
        const ctx = this.engine.ctx;
        if (this.cubes.length === 0) this.init(this.style);

        const cube = this.cubes[0];
        // Ensure cube position centers if resized
        cube.x = this.engine.width / 2;
        cube.y = this.engine.height / 2;

        cube.rx += 0.015; cube.ry += 0.01;

        const nodes = this.style === 2 ? [ // Platonic
            [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]
        ] : [ // Cube
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];

        const project = (x, y, z) => {
            let x1 = x * Math.cos(cube.ry) - z * Math.sin(cube.ry);
            let z1 = z * Math.cos(cube.ry) + x * Math.sin(cube.ry);
            let y2 = y * Math.cos(cube.rx) - z1 * Math.sin(cube.rx);
            let z2 = z1 * Math.cos(cube.rx) + y * Math.sin(cube.rx);
            const scale = 400 / (400 + z2 * cube.size);
            return {
                x: cube.x + x1 * cube.size * scale,
                y: cube.y + y2 * cube.size * scale
            };
        };

        const pts = nodes.map(n => project(n[0], n[1], n[2]));

        ctx.strokeStyle = this.engine.colors[0];
        ctx.lineWidth = 2;
        ctx.beginPath();

        const edges = this.style === 2 ? [
            [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [4, 3], [3, 5], [5, 2]
        ] : [
            [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        edges.forEach(e => {
            ctx.moveTo(pts[e[0]].x, pts[e[0]].y);
            ctx.lineTo(pts[e[1]].x, pts[e[1]].y);
        });
        ctx.stroke();

        if (this.style === 1) { // Crystal
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[1], 0.1);
            ctx.fill();
        }
    }
}
