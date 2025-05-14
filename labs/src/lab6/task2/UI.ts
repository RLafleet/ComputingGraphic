export class UI {
    private container: HTMLDivElement;
    private scoreElement: HTMLDivElement;
    private livesElement: HTMLDivElement;
    private tankCountElement: HTMLDivElement;
    private gameOverElement: HTMLDivElement;
    private messageElement: HTMLDivElement;
    private messageTimeout: number | null = null;

    constructor() {
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '10px';
        this.container.style.left = '10px';
        this.container.style.color = 'white';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.fontSize = '16px';
        this.container.style.textShadow = '1px 1px 2px black';
        this.scoreElement = document.createElement('div');
        this.scoreElement.style.marginBottom = '5px';
        this.container.appendChild(this.scoreElement);
        this.livesElement = document.createElement('div');
        this.livesElement.style.marginBottom = '5px';
        this.container.appendChild(this.livesElement);
        this.tankCountElement = document.createElement('div');
        this.tankCountElement.style.marginBottom = '5px';
        this.container.appendChild(this.tankCountElement);
        this.gameOverElement = document.createElement('div');
        this.gameOverElement.style.position = 'absolute';
        this.gameOverElement.style.top = '50%';
        this.gameOverElement.style.left = '50%';
        this.gameOverElement.style.transform = 'translate(-50%, -50%)';
        this.gameOverElement.style.color = 'white';
        this.gameOverElement.style.fontFamily = 'Arial, sans-serif';
        this.gameOverElement.style.fontSize = '48px';
        this.gameOverElement.style.fontWeight = 'bold';
        this.gameOverElement.style.textShadow = '2px 2px 4px black';
        this.gameOverElement.style.display = 'none';
        this.messageElement = document.createElement('div');
        this.messageElement.style.position = 'absolute';
        this.messageElement.style.top = '30%';
        this.messageElement.style.left = '50%';
        this.messageElement.style.transform = 'translate(-50%, -50%)';
        this.messageElement.style.color = 'gold';
        this.messageElement.style.fontSize = '28px';
        this.messageElement.style.fontWeight = 'bold';
        this.messageElement.style.textAlign = 'center';
        this.messageElement.style.display = 'none';
        this.messageElement.style.textShadow = '2px 2px 4px black';
        document.body.appendChild(this.container);
        document.body.appendChild(this.gameOverElement);
        document.body.appendChild(this.messageElement);
        this.updateScore(0);
        this.updateLives(3);
        this.updateTankCount(20);
    }

    public updateScore(score: number): void {
        this.scoreElement.textContent = `Счет: ${score}`;
    }

    public updateLives(lives: number): void {
        this.livesElement.textContent = `Жизни: ${lives}`;
    }
    
    public updateTankCount(count: number): void {
        this.tankCountElement.textContent = `Осталось танков противника: ${count}`;
    }

    public showGameOver(isVictory: boolean): void {
        this.gameOverElement.textContent = isVictory ? 'ПОБЕДА!' : 'ИГРА ОКОНЧЕНА';
        this.gameOverElement.style.color = isVictory ? '#00ff00' : '#ff0000';
        this.gameOverElement.style.display = 'block';
    }

    public hide(): void {
        this.container.style.display = 'none';
        this.gameOverElement.style.display = 'none';
    }

    public show(): void {
        this.container.style.display = 'block';
    }

    public showMessage(text: string, duration: number = 2000) {
        if (this.messageTimeout !== null) {
            window.clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }
        
        this.messageElement.textContent = text;
        this.messageElement.style.display = 'block';
        this.messageElement.style.opacity = '0';
        this.messageElement.style.fontSize = '20px';
        this.messageElement.style.transition = 'opacity 0.3s, font-size 0.3s';
        setTimeout(() => {
            this.messageElement.style.opacity = '1';
            this.messageElement.style.fontSize = '28px';
        }, 10);
        this.messageTimeout = window.setTimeout(() => {
            this.messageElement.style.opacity = '0';
            this.messageTimeout = window.setTimeout(() => {
                this.messageElement.style.display = 'none';
                this.messageTimeout = null;
            }, 300);
        }, duration);
    }
} 