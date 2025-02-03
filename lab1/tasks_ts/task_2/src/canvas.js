"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasApp = void 0;
var house_1 = require("./house");
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
        this.house = new house_1.House(this.ctx, initialX, initialY);
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
                _this.offsetX = mouseX - bounds.left;
                _this.offsetY = mouseY - bounds.top;
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
            if (_this.isDragging) {
                _this.isDragging = false;
            }
        });
    };
    return CanvasApp;
}());
exports.CanvasApp = CanvasApp;
