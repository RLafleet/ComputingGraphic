class GameModel {
    private words: { word: string; hint: string }[] = [];
    private selectedWord: string = "";
    private hint: string = "";
    private guessedLetters: string[] = [];
    private wrongGuesses: number = 0;
    private readonly maxMistakes: number = 7;

    async loadWords(): Promise<void> {
        const response = await fetch("words.json");
        this.words = await response.json();
    }

    startGame(): void {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        this.selectedWord = this.words[randomIndex].word.toUpperCase();
        this.hint = this.words[randomIndex].hint;
        this.guessedLetters = [];
        this.wrongGuesses = 0;
    }

    getHint(): string {
        return this.hint;
    }

    getWordDisplay(): string {
        return this.selectedWord
            .split("")
            .map(letter => this.guessedLetters.includes(letter) ? letter : "_")
            .join(" ");
    }

    isGameOver(): boolean {
        return this.wrongGuesses >= this.maxMistakes || !this.getWordDisplay().includes("_");
    }

    isWin(): boolean {
        return !this.getWordDisplay().includes("_");
    }

    guessLetter(letter: string): void {
        if (this.guessedLetters.includes(letter) || this.isGameOver()) return;

        if (this.selectedWord.includes(letter)) {
            this.guessedLetters.push(letter);
        } else {
            this.wrongGuesses++;
        }
    }

    getWrongGuesses(): number {
        return this.wrongGuesses;
    }

    getSelectedWord(): string {
        return this.selectedWord;
    }
}

class GameView {
    private model: GameModel;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private wordDisplay: HTMLElement;
    private lettersContainer: HTMLElement;
    private hintElement: HTMLElement;
    private restartButton: HTMLButtonElement;
    private themeSelector: HTMLSelectElement;
    private theme: string = "classic";

    constructor(model: GameModel) {
        this.model = model;
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
        this.wordDisplay = document.getElementById("word-display")!;
        this.lettersContainer = document.getElementById("letters")!;
        this.hintElement = document.getElementById("hint")!;
        this.restartButton = document.getElementById("restart")! as HTMLButtonElement;
        this.themeSelector = document.getElementById("theme") as HTMLSelectElement;

        this.canvas.width = 300;
        this.canvas.height = 400;

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.restartButton.addEventListener("click", () => this.restartGame());
        this.themeSelector.addEventListener("change", (e) => this.changeTheme(e));
    }

    private restartGame(): void {
        this.model.startGame();
        this.updateView();
        this.restartButton.style.display = "none";
    }

    private changeTheme(e: Event): void {
        const target = e.target as HTMLSelectElement;
        this.theme = target.value;

        document.body.classList.remove("classic", "dark", "cartoon");
        document.body.classList.add(this.theme);
        this.updateView();
    }

    private getThemeColor(): string {
        switch (this.theme) {
            case "dark": return "white";
            case "cartoon": return "blue";
            default: return "black";
        }
    }

    updateView(): void {
        this.hintElement.textContent = `Подсказка: ${this.model.getHint()}`;
        this.wordDisplay.textContent = this.model.getWordDisplay();
        this.generateLetters();
        this.drawGallows();
        this.drawHangman();

        if (this.model.isGameOver()) {
            this.alertGameOver(this.model.isWin());
        }
    }

    private drawGallows(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = this.getThemeColor();
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        this.ctx.moveTo(50, 350);
        this.ctx.lineTo(250, 350);
        this.ctx.moveTo(100, 350);
        this.ctx.lineTo(100, 50);
        this.ctx.lineTo(200, 50);
        this.ctx.lineTo(200, 80);
        this.ctx.stroke();
    }

    private drawHangman(): void {
        this.ctx.strokeStyle = this.getThemeColor();
        const drawSteps = [
            () => {
                this.ctx.beginPath();
                this.ctx.arc(200, 100, 20, 0, Math.PI * 2);
                this.ctx.stroke();
            },
            () => {
                this.ctx.moveTo(200, 120);
                this.ctx.lineTo(200, 200);
                this.ctx.stroke();
            },
            () => {
                this.ctx.moveTo(200, 140);
                this.ctx.lineTo(170, 180);
                this.ctx.stroke();
            },
            () => {
                this.ctx.moveTo(200, 140);
                this.ctx.lineTo(230, 180);
                this.ctx.stroke();
            },
            () => {
                this.ctx.moveTo(200, 200);
                this.ctx.lineTo(170, 250);
                this.ctx.stroke();
            },
            () => {
                this.ctx.moveTo(200, 200);
                this.ctx.lineTo(230, 250);
                this.ctx.stroke();
            }
        ];

        for (let i = 0; i < this.model.getWrongGuesses() && i < drawSteps.length; i++) {
            drawSteps[i]();
        }
    }

    private generateLetters(): void {
        this.lettersContainer.innerHTML = "";
        const alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
        for (let letter of alphabet) {
            const btn = document.createElement("span");
            btn.classList.add("letter");
            btn.textContent = letter;
            btn.addEventListener("click", () => this.handleLetterClick(letter, btn));
            this.lettersContainer.appendChild(btn);
        }
    }

    private handleLetterClick(letter: string, btn: HTMLSpanElement): void {
        this.model.guessLetter(letter);
        if (this.model.getSelectedWord().includes(letter)) {
            btn.classList.add("correct");
        } else {
            btn.classList.add("wrong");
        }
        this.updateView();
    }

    private alertGameOver(won: boolean): void {
        setTimeout(() => {
            alert(won ? "Вы выйграли, вы молодец :)" : `Вы проиграли! Слово: ${this.model.getSelectedWord()}`);
            this.restartButton.style.display = "block";
        }, 500);
    }
}

window.onload = async () => {
    const model = new GameModel();
    await model.loadWords();
    model.startGame();

    const view = new GameView(model);
    view.updateView();
};