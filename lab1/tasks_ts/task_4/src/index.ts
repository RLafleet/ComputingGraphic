class HangmanCanvas {
    private ctx: CanvasRenderingContext2D;
    private theme: string = "classic";

    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d")!;
        this.canvas.width = 300;
        this.canvas.height = 400;
    }

    setTheme(theme: string) {
        this.theme = theme;
        this.drawGallows();
    }

    private getThemeColor(): string {
        switch (this.theme) {
            case "dark": return "white";
            case "cartoon": return "blue";
            default: return "black";
        }
    }

    drawGallows() {
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

    drawHangman(stage: number) {
        this.ctx.strokeStyle = this.getThemeColor();
        switch (stage) {
            case 1: this.ctx.beginPath(); this.ctx.arc(200, 100, 20, 0, Math.PI * 2); this.ctx.stroke(); break;
            case 2: this.ctx.moveTo(200, 120); this.ctx.lineTo(200, 200); this.ctx.stroke(); break;
            case 3: this.ctx.moveTo(200, 140); this.ctx.lineTo(170, 180); this.ctx.stroke(); break;
            case 4: this.ctx.moveTo(200, 140); this.ctx.lineTo(230, 180); this.ctx.stroke(); break;
            case 5: this.ctx.moveTo(200, 200); this.ctx.lineTo(170, 250); this.ctx.stroke(); break;
            case 6: this.ctx.moveTo(200, 200); this.ctx.lineTo(230, 250); this.ctx.stroke(); break;
        }
    }
}

class WordManager {
    private words: { word: string; hint: string }[] = [];

    async loadWords() {
        const response = await fetch("words.json");
        this.words = await response.json();
    }

    getRandomWord(): { word: string; hint: string } {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        return this.words[randomIndex];
    }
}

class HangmanGame {
    private selectedWord: string = "";
    private hint: string = "";
    private guessedLetters: string[] = [];
    private wrongGuesses: number = 0;
    private maxMistakes: number = 7;

    constructor(
        private wordDisplay: HTMLElement,
        private lettersContainer: HTMLElement,
        private hintElement: HTMLElement,
        private restartButton: HTMLButtonElement,
        private canvas: HangmanCanvas,
        private wordManager: WordManager
    ) {
        this.restartButton.addEventListener("click", () => this.startGame());
    }

    async startGame() {
        const wordData = this.wordManager.getRandomWord();
        this.selectedWord = wordData.word.toUpperCase();
        this.hint = wordData.hint;
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.hintElement.textContent = `Подсказка: ${this.hint}`;

        this.canvas.drawGallows();
        this.updateWordDisplay();
        this.generateLetters();
        this.restartButton.style.display = "none";
    }

    private updateWordDisplay() {
        this.wordDisplay.innerHTML = this.selectedWord
            .split("")
            .map(letter => this.guessedLetters.includes(letter) ? letter : "_")
            .join(" ");

        if (!this.wordDisplay.innerText.includes("_")) {
            this.alertGameOver(true);
        }
    }

    private generateLetters() {
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

    private handleLetterClick(letter: string, btn: HTMLSpanElement) {
        if (this.guessedLetters.includes(letter) || this.wrongGuesses >= this.maxMistakes) return;

        if (this.selectedWord.includes(letter)) {
            this.guessedLetters.push(letter);
            btn.classList.add("correct");
        } else {
            this.wrongGuesses++;
            btn.classList.add("wrong");
            this.canvas.drawHangman(this.wrongGuesses);
        }

        this.updateWordDisplay();
    }

    private alertGameOver(won: boolean) {
        setTimeout(() => {
            alert(won ? "Поздравляем! Вы угадали слово!" : `Вы проиграли! Загаданное слово: ${this.selectedWord}`);
            this.restartButton.style.display = "block";
        }, 500);
    }
}

class ThemeManager {
    constructor(private themeSelector: HTMLSelectElement, private canvas: HangmanCanvas) {
        this.themeSelector.addEventListener("change", (e) => {
            const target = e.target as HTMLSelectElement;
            this.applyTheme(target.value);
        });
    }

    private applyTheme(theme: string) {
        document.body.classList.remove("classic", "dark", "cartoon");
        document.body.classList.add(theme);
        this.canvas.setTheme(theme);
    }
}

window.onload = async () => {
    const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
    const wordDisplay = document.getElementById("word-display")!;
    const lettersContainer = document.getElementById("letters")!;
    const hintElement = document.getElementById("hint")!;
    const restartButton = document.getElementById("restart")! as HTMLButtonElement;
    const themeSelector = document.getElementById("theme") as HTMLSelectElement;

    const canvas = new HangmanCanvas(canvasElement);
    const wordManager = new WordManager();
    await wordManager.loadWords();

    const game = new HangmanGame(wordDisplay, lettersContainer, hintElement, restartButton, canvas, wordManager);
    const themeManager = new ThemeManager(themeSelector, canvas);

    game.startGame();
};
