const INIT_Y = 100;
const HEIGHT_OF_JUMP = 50;
const ANIMATION_DURATION = 1000;

class JumpingLetter {
    constructor(initial, x, color, phase, initialY = INIT_Y, jumpHeight = HEIGHT_OF_JUMP, animationDuration = ANIMATION_DURATION) {
        this.initial = initial;
        this.x = x;
        this.color = color;
        this.phase = phase;
        this.initialY = initialY;
        this.jumpHeight = jumpHeight;
        this.animationDuration = animationDuration;
        this.startTime = null;
    }

    Draw(ctx, currentTime) {
        if (this.startTime === null) {
            this.startTime = currentTime;
        }
        const time = (currentTime - this.startTime + this.phase) % this.animationDuration;
        const jumpProgress = Math.sin(time / this.animationDuration * Math.PI);
        const y = this.initialY - jumpProgress * this.jumpHeight;

        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        switch (this.initial) {
            case 'H':
                ctx.moveTo(this.x, y);
                ctx.lineTo(this.x, y - 30);
                ctx.moveTo(this.x, y - 15);
                ctx.lineTo(this.x + 30, y - 15);
                ctx.moveTo(this.x + 30, y);
                ctx.lineTo(this.x + 30, y - 30);
                break;
            case 'M':
                ctx.moveTo(this.x, y);
                ctx.lineTo(this.x, y - 30);
                ctx.lineTo(this.x + 15, y - 15);
                ctx.lineTo(this.x + 30, y - 30);
                ctx.lineTo(this.x + 30, y);
                break;
            case 'D':
                ctx.moveTo(this.x, y);
                ctx.lineTo(this.x, y - 30);
                ctx.quadraticCurveTo(this.x + 30, y - 30, this.x + 30, y - 15);
                ctx.quadraticCurveTo(this.x + 30, y, this.x, y);
                break;
            default:
                console.warn(`Letter "${this.initial}" not defined`);
                break;
        }
        ctx.stroke();
    }
}

window.onload = function() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    const letters = [
        new JumpingLetter('H', 50, 'red', 0),
        new JumpingLetter('M', 120, 'green', 200),
        new JumpingLetter('D', 190, 'blue', 400)
    ];

    function Animate() {
        const currentTime = Date.now();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        letters.forEach(letter => {
            letter.Draw(ctx, currentTime);
        });

        requestAnimationFrame(Animate);
    }

    Animate();
}
