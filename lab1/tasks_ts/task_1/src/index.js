const SIZE = 'bold 50px sans-serif';
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

    draw(ctx, currentTime) {
        if (this.startTime === null) {
            this.startTime = currentTime;
        }
        const time = (currentTime - this.startTime + this.phase) % this.animationDuration;
        const jumpProgress = Math.sin(time / this.animationDuration * Math.PI);
        const y = this.initialY - jumpProgress * this.jumpHeight;

        ctx.fillStyle = this.color;
        ctx.font = SIZE;
        ctx.fillText(this.initial, this.x, y);
    }
}

window.onload = function() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    const letters = [
        new JumpingLetter('A', 50, 'red', 0),
        new JumpingLetter('B', 120, 'green', 200),
        new JumpingLetter('C', 190, 'blue', 400)
    ];

    function animate() {
        const currentTime = Date.now();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        letters.forEach(letter => {
            letter.draw(ctx, currentTime);
        });

        requestAnimationFrame(animate);
    }

    animate();
}
