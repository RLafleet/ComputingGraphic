const JUMP_HEIGHT = 50;
const JUMP_DURATION = 500;
const FALL_DURATION = 500;
const POSITION_INCREMENT_JUMP = 20;
const POSITION_INCREMENT_FALL = 20;
const FALL_RESET_POSITION = 50;
const JUMP_INTERVAL_STEPS = 10;

function changeColor(letter, color) {
    letter.setAttribute('fill', color);
}

const letters = document.querySelectorAll('.initials');

function jump(letter, delay) {
    setTimeout(() => {
        let positionY = 0;

        // учитывать сколько реально времени прошло.
        // привязать смещение между анимациями к предыдущему
        // равноускоренное
        const interval = setInterval(() => {
            positionY += POSITION_INCREMENT_JUMP;
            letter.style.transform = `translateY(-${positionY}px)`;

            if (positionY >= JUMP_HEIGHT - 10) {
                clearInterval(interval);
                fall(letter);
            }
        }, JUMP_DURATION / (JUMP_HEIGHT / JUMP_INTERVAL_STEPS));
    }, delay);
}

function fall(letter) {
    let positionY = FALL_RESET_POSITION;

    const interval = setInterval(() => {
        positionY -= POSITION_INCREMENT_FALL;
        letter.style.transform = `translateY(-${positionY}px)`;

        if (positionY <= 0) {
            clearInterval(interval);
            jump(letter, 100);
        }
    }, FALL_DURATION / (FALL_RESET_POSITION / JUMP_INTERVAL_STEPS));
}

letters.forEach((letter, index) => {
    letter.addEventListener('mouseover', () => changeColor(letter, 'orange'));
    letter.addEventListener('mouseout', () => changeColor(letter, ''));

    jump(letter, index * 200);
});
