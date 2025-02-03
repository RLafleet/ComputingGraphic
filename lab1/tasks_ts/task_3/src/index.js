function changeColor(letter, color) {
    letter.setAttribute('fill', color);
}
var letters = document.querySelectorAll('.initials');
// Функция для анимации подпрыгивания
function jump(letter, delay) {
    setTimeout(function () {
        var positionY = 0; // Начальная позиция
        var jumpHeight = Math.random() * 200 + 30; // Случайная высота прыжка (от 30 до 80)
        var duration = Math.random() * 500 + 300; // Случайная длительность (от 300 до 800 мс)
        var interval = setInterval(function () {
            positionY += 5; // Увеличиваем позицию по Y
            letter.style.transform = "translateY(-".concat(positionY, "px)"); // Применяем трансформацию
            if (positionY >= jumpHeight) { // Когда достигаем высоты прыжка
                clearInterval(interval);
                fall(letter, duration); // Начинаем падение
            }
        }, duration / (jumpHeight / 5)); // Интервал обновления
    }, delay);
}
// Функция для падения буквы
function fall(letter, duration) {
    var positionY = parseFloat(getComputedStyle(letter).transform.split(',')[5]) || 0; // Получаем текущую позицию Y
    var interval = setInterval(function () {
        positionY -= 5; // Уменьшаем позицию по Y
        letter.style.transform = "translateY(-".concat(positionY, "px)"); // Применяем трансформацию
        if (positionY <= 0) { // Когда буква вернулась на место
            clearInterval(interval);
            jump(letter, Math.random() * 200); // Запускаем новый прыжок с случайной задержкой
        }
    }, duration / (50 / 5)); // Интервал обновления
}
// Запускаем анимацию для каждой буквы с различной задержкой
letters.forEach(function (letter, index) {
    letter.addEventListener('mouseover', function () { return changeColor(letter, 'orange'); });
    letter.addEventListener('mouseout', function () { return changeColor(letter, ''); });
    jump(letter, index * 200); // Задержка для каждой буквы
});
