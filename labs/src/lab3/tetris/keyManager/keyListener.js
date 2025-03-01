function keyEventListener() {
    document.addEventListener('keydown', (event) => {
        const keyname = event.key;
        if (state === OVER) {
            if (keyname === "r") {
                restart = 1;
            } else if (keyname === "q") {
                closeBrowserTab();
            }
        } else {
            if (keyname === "ArrowLeft") {
                moveLeft();
            } else if (keyname === "ArrowRight") {
                moveRight();
            } else if (keyname === "ArrowDown") {
                moveDownF();
            } else if (keyname === 'ArrowUp') {
                rotation();
            }
        }
    });
}

function closeBrowserTab() {
    window.opener = null;
    window.close();
}