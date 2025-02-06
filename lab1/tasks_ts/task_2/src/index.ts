class CanvasApp {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private house: House;
    private isDragging: boolean = false;
    private offsetX: number = 0;
    private offsetY: number = 0;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) throw new Error("Canvas not found");

        this.ctx = this.canvas.getContext("2d")!;
        this.canvas.width = 600;
        this.canvas.height = 400;

        const initialX = 200;
        const initialY = 150;
        this.house = new House(this.ctx, initialX, initialY);

        this.house.draw();
        this.addEventListeners();
    }

    private addEventListeners() {
        this.canvas.addEventListener("mousedown", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const bounds = this.house.getBounds();
            if (mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom) {
                this.isDragging = true;
                this.offsetX = mouseX - this.house.getX();
                this.offsetY = mouseY - this.house.getY();
            }
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const newX = e.clientX - rect.left - this.offsetX;
                const newY = e.clientY - rect.top - this.offsetY;
                this.house.setPosition(newX, newY);
                this.house.draw();
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            this.isDragging = false;
        });
    }
}

class House {
    private ctx: CanvasRenderingContext2D;
    private x: number;
    private y: number;
    private width: number = 150;
    private height: number = 100;
    private roofHeight: number = 50;
    private fenceHeight: number = 40;

    constructor(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
    }

    public draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.ctx.fillStyle = "saddlebrown";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        this.ctx.fillStyle = "darkred";
        this.ctx.beginPath();
        this.ctx.moveTo(this.x - 10, this.y);
        this.ctx.lineTo(this.x + this.width / 2, this.y - this.roofHeight);
        this.ctx.lineTo(this.x + this.width + 10, this.y);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = "peru";
        this.ctx.fillRect(this.x + 60, this.y + 50, 30, 50);

        this.ctx.fillStyle = "lightblue";
        this.ctx.fillRect(this.x + 15, this.y + 25, 30, 30);
        this.ctx.fillRect(this.x + 105, this.y + 25, 30, 30);

        this.ctx.strokeStyle = "sienna";
        this.ctx.lineWidth = 4;
        for (let i = -10; i < this.width + 20; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x + i, this.y + this.height);
            this.ctx.lineTo(this.x + i, this.y + this.height + this.fenceHeight);
            this.ctx.stroke();
        }

        this.ctx.beginPath();
        this.ctx.moveTo(this.x - 20, this.y + this.height + 20);
        this.ctx.lineTo(this.x + this.width + 10, this.y + this.height + 20);
        this.ctx.stroke();
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public getBounds() {
        return {
            left: this.x - 10,
            right: this.x + this.width + 10,
            top: this.y - this.roofHeight,
            bottom: this.y + this.height + this.fenceHeight,
        };
    }

    public getX() {
        return this.x;
    }

    public getY() {
        return this.y;
    }
}

window.onload = () => {
    new CanvasApp("canvas");
};
