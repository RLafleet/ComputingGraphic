class GameModel {
    constructor(words, maxMistakes = 7) {
        this.words = words;
        this.maxMistakes = maxMistakes;
        this.resetGame();
    }

    resetGame() {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        this.selectedWord = this.words[randomIndex].word.toUpperCase();
        this.hint = this.words[randomIndex].hint;
        this.guessedLetters = [];
        this.wrongGuesses = 0;
    }

    guessLetter(letter) {
        if (this.guessedLetters.includes(letter) || this.wrongGuesses >= this.maxMistakes) {
            return false;
        }

        if (this.selectedWord.includes(letter)) {
            this.guessedLetters.push(letter);
            return true;
        } else {
            this.wrongGuesses++;
            return false;
        }
    }

    isGameOver() {
        return this.wrongGuesses >= this.maxMistakes || this.isGameWon();
    }

    isGameWon() {
        return this.selectedWord.split('').every(letter => this.guessedLetters.includes(letter));
    }
}

class GameView {
    constructor(model) {
        this.model = model;
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.wordDisplay = document.getElementById("word-display");
        this.lettersContainer = document.getElementById("letters");
        this.hintElement = document.getElementById("hint");
        this.restartButton = document.getElementById("restart");
        this.themeSelector = document.getElementById("theme");
        this.theme = "classic";

        this.canvas.width = 300;
        this.canvas.height = 400;

        this.restartButton.addEventListener("click", () => this.startGame());
        this.themeSelector.addEventListener("change", (e) => this.changeTheme(e.target.value));

        this.startGame();
    }

    getThemeColor() {
        switch (this.theme) {
            case "dark": return "white";
            case "cartoon": return "blue";
            default: return "black";
        }
    }

    startGame() {
        this.model.resetGame();
        this.hintElement.textContent = `Подсказка: ${this.model.hint}`;
        this.drawGallows();
        this.updateWordDisplay();
        this.generateLetters();
        this.restartButton.style.display = "none";
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

    drawHangman() {
        const ctx = this.ctx;
        ctx.strokeStyle = this.getThemeColor();
        const drawSteps = [
            () => { ctx.beginPath(); ctx.arc(200, 100, 20, 0, Math.PI * 2); ctx.stroke(); },
            () => { ctx.moveTo(200, 120); ctx.lineTo(200, 200); ctx.stroke(); },
            () => { ctx.moveTo(200, 140); ctx.lineTo(170, 180); ctx.stroke(); },
            () => { ctx.moveTo(200, 140); ctx.lineTo(230, 180); ctx.stroke(); },
            () => { ctx.moveTo(200, 200); ctx.lineTo(170, 250); ctx.stroke(); },
            () => { ctx.moveTo(200, 200); ctx.lineTo(230, 250); ctx.stroke(); }
        ];

        drawSteps.slice(0, this.model.wrongGuesses).forEach(step => step());
    }

    updateWordDisplay() {
        this.wordDisplay.innerHTML = this.model.selectedWord
            .split("")
            .map(letter => this.model.guessedLetters.includes(letter) ? letter : "_")
            .join(" ");

        if (this.model.isGameWon()) {
            this.alertGameOver(true);
        }
    }

    generateLetters() {
        this.lettersContainer.innerHTML = "";
        "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("").forEach(letter => {
            const btn = document.createElement("span");
            btn.classList.add("letter");
            btn.textContent = letter;
            btn.addEventListener("click", () => this.handleLetterClick(letter, btn));
            this.updateAdditionalInfo();
            this.lettersContainer.appendChild(btn);
        });
    }

    handleLetterClick(letter, btn) {
        if (this.model.guessLetter(letter)) {
            this.updateAdditionalInfo();
            btn.classList.add("correct");
        } else {
            btn.classList.add("wrong");
            this.updateAdditionalInfo();
            this.drawHangman();
        }
        this.updateWordDisplay();

        if (this.model.isGameOver()) {
            this.alertGameOver(this.model.isGameWon());
        }
    }

    alertGameOver(won) {
        setTimeout(() => {
            alert(won ? "Вы выиграли, молодец!" : `Вы проиграли! Слово: ${this.model.selectedWord}`);
            this.restartButton.style.display = "block";
        }, 500);
    }

    changeTheme(theme) {
        this.theme = theme;
        document.body.classList.remove("classic", "dark", "cartoon");
        document.body.classList.add(theme);
        this.drawGallows();
        this.drawHangman();

        if (theme === "cartoon") {
            this.showAdditionalInfo();
        } else {
            this.hideAdditionalInfo();
        }
    }

    showAdditionalInfo() {
        if (!this.infoPanel) {
            this.infoPanel = document.createElement("div");
            this.infoPanel.id = "info-panel";
            document.body.appendChild(this.infoPanel);
        }
        this.updateAdditionalInfo();
    }

    hideAdditionalInfo() {
        if (this.infoPanel) {
            this.infoPanel.remove();
            this.infoPanel = null;
        }
    }

    updateAdditionalInfo() {
        if (this.infoPanel) {
            this.infoPanel.innerHTML = `
            <p>Использованные буквы: ${this.model.guessedLetters.join(", ") || "Нет"}</p>
            <p>Ошибки: ${this.model.wrongGuesses} / ${this.model.maxMistakes}</p>
            <p>Осталось попыток: ${this.model.maxMistakes - this.model.wrongGuesses}</p>
        `;
        }
    }
}

async function loadWordsAndStartGame() {
    const response = await fetch("words.json");
    const words = await response.json();
    const model = new GameModel(words);
    new GameView(model);
}

window.onload = loadWordsAndStartGame;
