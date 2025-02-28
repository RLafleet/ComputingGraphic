document.addEventListener('DOMContentLoaded', () => {
    GridManager.initGridColors();
    Renderer.updateColorsArray();
    EventManager.keyEventListener();
    GameManager.startGame();
});