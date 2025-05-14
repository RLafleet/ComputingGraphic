import { Game } from '../Game'; 
export class InputHandler {
    private game: Game;
    private keys: { [key: string]: boolean } = {};
    constructor(game: Game) {
        this.game = game;
        this.setupInputHandlers();
    }
    private setupInputHandlers(): void {
        console.log("Setting up input handlers - registering keyboard events");
        this.keys = {};
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            this.keys[e.key] = true;
            if (e.key === ' ') {
                this.game.playerShoot(); 
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            this.keys[e.key] = false;
        };
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        console.log("Input handlers set up successfully");
    }
    public getKeys(): { [key: string]: boolean } {
        return this.keys;
    }
} 