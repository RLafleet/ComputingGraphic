var CanvasApp = /** @class */ (function () {
    function CanvasApp(canvasId) {
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas)
            throw new Error("Canvas not found");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 600;
        this.canvas.height = 400;
        var initialX = 200;
        var initialY = 150;
        this.house = new House(this.ctx, initialX, initialY);
        this.house.draw();
        this.addEventListeners();
    }
    CanvasApp.prototype.addEventListeners = function () {
        var _this = this;
        this.canvas.addEventListener("mousedown", function (e) {
            var rect = _this.canvas.getBoundingClientRect();
            var mouseX = e.clientX - rect.left;
            var mouseY = e.clientY - rect.top;
            var bounds = _this.house.getBounds();
            if (mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom) {
                _this.isDragging = true;
                // Исправление: смещение вычисляется относительно фактического клика
                _this.offsetX = mouseX - _this.house.getX();
                _this.offsetY = mouseY - _this.house.getY();
            }
        });
        this.canvas.addEventListener("mousemove", function (e) {
            if (_this.isDragging) {
                var rect = _this.canvas.getBoundingClientRect();
                var newX = e.clientX - rect.left - _this.offsetX;
                var newY = e.clientY - rect.top - _this.offsetY;
                _this.house.setPosition(newX, newY);
                _this.house.draw();
            }
        });
        this.canvas.addEventListener("mouseup", function () {
            _this.isDragging = false;
        });
    };
    return CanvasApp;
}());
var House = /** @class */ (function () {
    function House(ctx, x, y) {
        this.width = 150;
        this.height = 100;
        this.roofHeight = 50;
        this.fenceHeight = 40;
        this.ctx = ctx;
        this.x = x;
        this.y = y;
    }
    House.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // Дом
        this.ctx.fillStyle = "saddlebrown";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        // Крыша
        this.ctx.fillStyle = "darkred";
        this.ctx.beginPath();
        this.ctx.moveTo(this.x - 10, this.y);
        this.ctx.lineTo(this.x + this.width / 2, this.y - this.roofHeight);
        this.ctx.lineTo(this.x + this.width + 10, this.y);
        this.ctx.closePath();
        this.ctx.fill();
        // Дверь
        this.ctx.fillStyle = "peru";
        this.ctx.fillRect(this.x + 60, this.y + 50, 30, 50);
        // Окна
        this.ctx.fillStyle = "lightblue";
        this.ctx.fillRect(this.x + 15, this.y + 25, 30, 30);
        this.ctx.fillRect(this.x + 105, this.y + 25, 30, 30);
        // Забор
        this.ctx.strokeStyle = "sienna";
        this.ctx.lineWidth = 4;
        for (var i = -10; i < this.width + 20; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x + i, this.y + this.height);
            this.ctx.lineTo(this.x + i, this.y + this.height + this.fenceHeight);
            this.ctx.stroke();
        }
        this.ctx.beginPath();
        this.ctx.moveTo(this.x - 20, this.y + this.height + 20);
        this.ctx.lineTo(this.x + this.width + 10, this.y + this.height + 20);
        this.ctx.stroke();
    };
    House.prototype.setPosition = function (x, y) {
        this.x = x;
        this.y = y;
    };
    House.prototype.getBounds = function () {
        return {
            left: this.x - 10,
            right: this.x + this.width + 10,
            top: this.y - this.roofHeight,
            bottom: this.y + this.height + this.fenceHeight,
        };
    };
    House.prototype.getX = function () {
        return this.x;
    };
    House.prototype.getY = function () {
        return this.y;
    };
    return House;
}());
window.onload = function () {
    new CanvasApp("canvas");
};
