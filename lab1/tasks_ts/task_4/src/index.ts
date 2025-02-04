window.onload = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const wordDisplay = document.getElementById("word-display")!;
    const lettersContainer = document.getElementById("letters")!;
    const hintElement = document.getElementById("hint")!;
    const restartButton = document.getElementById("restart")! as HTMLButtonElement;
    const themeSelector = document.getElementById("theme") as HTMLSelectElement;

    canvas.width = 300;
    canvas.height = 400;

    let words: { word: string; hint: string }[] = [];
    let selectedWord = "";
    let hint = "";
    let guessedLetters: string[] = [];
    let wrongGuesses = 0;
    const maxMistakes = 7;
    let theme = "classic";

    function getThemeColor(): string {
        switch (theme) {
            case "dark": return "white";
            case "cartoon": return "blue";
            default: return "black";
        }
    }

    async function loadWords() {
        const response = await fetch("words.json");
        words = await response.json();
        startGame();
    }

    function startGame() {
        const randomIndex = Math.floor(Math.random() * words.length);
        selectedWord = words[randomIndex].word.toUpperCase();
        hint = words[randomIndex].hint;

        guessedLetters = [];
        wrongGuesses = 0;
        hintElement.textContent = `Подсказка: ${hint}`;

        drawGallows();
        updateWordDisplay();
        generateLetters();
    }

    function drawGallows() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = getThemeColor();
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(50, 350);
        ctx.lineTo(250, 350);
        ctx.moveTo(100, 350);
        ctx.lineTo(100, 50);
        ctx.lineTo(200, 50);
        ctx.lineTo(200, 80);
        ctx.stroke();
    }

    function drawHangman() {
        ctx.strokeStyle = getThemeColor();
        const drawSteps = [
            function() {
                ctx.beginPath();
                ctx.arc(200, 100, 20, 0, Math.PI * 2);
                ctx.stroke();
            },
            function() {
                ctx.moveTo(200, 120);
                ctx.lineTo(200, 200);
                ctx.stroke();
            },
            function() {
                ctx.moveTo(200, 140);
                ctx.lineTo(170, 180);
                ctx.stroke();
            },
            function() {
                ctx.moveTo(200, 140);
                ctx.lineTo(230, 180);
                ctx.stroke();
            },
            function() {
                ctx.moveTo(200, 200);
                ctx.lineTo(170, 250);
                ctx.stroke();
            },
            function() {
                ctx.moveTo(200, 200);
                ctx.lineTo(230, 250);
                ctx.stroke();
            }
        ];

        for (let i = 0; i < wrongGuesses && i < drawSteps.length; i++) {
            drawSteps[i]();
        }

        if (wrongGuesses >= drawSteps.length) {
            alertGameOver(false);
        }
    }


    function updateWordDisplay() {
        wordDisplay.innerHTML = selectedWord
            .split("")
            .map(letter => guessedLetters.includes(letter) ? letter : "_")
            .join(" ");

        if (!wordDisplay.innerText.includes("_")) {
            alertGameOver(true);
        }
    }

    function generateLetters() {
        lettersContainer.innerHTML = "";
        const alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
        for (let letter of alphabet) {
            const btn = document.createElement("span");
            btn.classList.add("letter");
            btn.textContent = letter;
            btn.addEventListener("click", () => handleLetterClick(letter, btn));
            lettersContainer.appendChild(btn);
        }
    }

    function handleLetterClick(letter: string, btn: HTMLSpanElement) {
        if (guessedLetters.includes(letter) || wrongGuesses >= maxMistakes) return;

        if (selectedWord.includes(letter)) {
            guessedLetters.push(letter);
            btn.classList.add("correct");
        } else {
            wrongGuesses++;
            btn.classList.add("wrong");
            drawHangman();
        }

        updateWordDisplay();
    }

    function alertGameOver(won: boolean) {
        setTimeout(() => {
            alert(won ? "Вы выйграли, вы молодец :)" : `Вы проиграли! Слово: ${selectedWord}`);
            restartButton.style.display = "block";
        }, 500);
    }

    restartButton.addEventListener("click", () => {
        restartButton.style.display = "none";
        startGame();
    });

    restartButton.addEventListener("click", () => {
        restartButton.style.display = "none";
        startGame();
    });

    themeSelector.addEventListener("change", (e) => {
        const target = e.target as HTMLSelectElement;
        theme = target.value;

        document.body.classList.remove("classic", "dark", "cartoon");
        document.body.classList.add(theme);
        drawGallows();
        drawHangman();
    });

    loadWords().then(r => {});
};
