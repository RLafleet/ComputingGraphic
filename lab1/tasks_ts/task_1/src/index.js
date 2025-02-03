function changeColor(letter, color) {
    letter.setAttribute('fill', color);
}
var letters = document.querySelectorAll('.initials');
function jump(letter, delay) {
    setTimeout(function () {
        var positionY = 0;
        var jumpHeight = 50;
        var duration = 500;
        var interval = setInterval(function () {
            positionY += 20;
            letter.style.transform = "translateY(-".concat(positionY, "px)");
            if (positionY >= jumpHeight - 10) {
                clearInterval(interval);
                fall(letter);
            }
        }, duration / (jumpHeight / 10));
    }, delay);
}
function fall(letter) {
    var positionY = 50;
    var duration = 500;
    var interval = setInterval(function () {
        positionY -= 20;
        letter.style.transform = "translateY(-".concat(positionY, "px)");
        if (positionY <= 0) {
            clearInterval(interval);
            jump(letter, 100);
        }
    }, duration / (50 / 10));
}
letters.forEach(function (letter, index) {
    letter.addEventListener('mouseover', function () { return changeColor(letter, 'orange'); });
    letter.addEventListener('mouseout', function () { return changeColor(letter, ''); });
    jump(letter, index * 200);
});
