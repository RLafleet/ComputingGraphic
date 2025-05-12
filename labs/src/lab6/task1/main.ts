import { Scene } from './scene';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('scene-container');
    if (!container) {
        console.error('Could not find scene container element');
        return;
    }

    const scene = new Scene(container);
    
    scene.loadModels();
}); 

// поправить текстуру крышы
// поправить качели(анимацию)

// модель с домом, прям загружать