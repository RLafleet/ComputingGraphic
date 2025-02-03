"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.House = void 0;
var House = /** @class */ (function () {
    function House(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
    }
    House.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = "saddlebrown";
        this.ctx.fillRect(this.x, this.y, 150, 100);
        this.ctx.fillStyle = "darkred";
        this.ctx.beginPath();
        this.ctx.moveTo(this.x - 10, this.y);
        this.ctx.lineTo(this.x + 75, this.y - 50);
        this.ctx.lineTo(this.x + 160, this.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = "peru";
        this.ctx.fillRect(this.x + 60, this.y + 50, 30, 50);
        this.ctx.fillStyle = "lightblue";
        this.ctx.fillRect(this.x + 15, this.y + 25, 30, 30);
        this.ctx.fillRect(this.x + 105, this.y + 25, 30, 30);
        this.ctx.strokeStyle = "sienna";
        this.ctx.lineWidth = 4;
        for (var i = -40; i < 200; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x + i, this.y + 100);
            this.ctx.lineTo(this.x + i, this.y + 140);
            this.ctx.stroke();
        }
        this.ctx.beginPath();
        this.ctx.moveTo(this.x - 40, this.y + 120);
        this.ctx.lineTo(this.x + 190, this.y + 120);
        this.ctx.stroke();
    };
    House.prototype.setPosition = function (x, y) {
        this.x = x;
        this.y = y;
    };
    House.prototype.getBounds = function () {
        return {
            left: this.x,
            right: this.x + 150,
            top: this.y,
            bottom: this.y + 100,
        };
    };
    return House;
}());
exports.House = House;
