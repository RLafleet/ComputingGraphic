var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
window.onload = function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var wordDisplay = document.getElementById("word-display");
    var lettersContainer = document.getElementById("letters");
    var hintElement = document.getElementById("hint");
    var restartButton = document.getElementById("restart");
    canvas.width = 300;
    canvas.height = 400;
    var words = [];
    var selectedWord = "";
    var hint = "";
    var guessedLetters = [];
    var wrongGuesses = 0;
    var maxMistakes = 7;
    // Загрузка слов из JSON-файла
    function loadWords() {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("words.json")];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        words = _a.sent();
                        startGame();
                        return [2 /*return*/];
                }
            });
        });
    }
    function startGame() {
        var randomIndex = Math.floor(Math.random() * words.length);
        selectedWord = words[randomIndex].word.toUpperCase();
        hint = words[randomIndex].hint;
        guessedLetters = [];
        wrongGuesses = 0;
        hintElement.textContent = "\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430: ".concat(hint);
        drawGallows();
        updateWordDisplay();
        generateLetters();
    }
    function drawGallows() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        // Основа
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
        ctx.strokeStyle = "black";
        switch (wrongGuesses) {
            case 1:
                ctx.beginPath();
                ctx.arc(200, 100, 20, 0, Math.PI * 2);
                ctx.stroke();
                break; // Голова
            case 2:
                ctx.moveTo(200, 120);
                ctx.lineTo(200, 200);
                ctx.stroke();
                break; // Тело
            case 3:
                ctx.moveTo(200, 140);
                ctx.lineTo(170, 180);
                ctx.stroke();
                break; // Левая рука
            case 4:
                ctx.moveTo(200, 140);
                ctx.lineTo(230, 180);
                ctx.stroke();
                break; // Правая рука
            case 5:
                ctx.moveTo(200, 200);
                ctx.lineTo(170, 250);
                ctx.stroke();
                break; // Левая нога
            case 6:
                ctx.moveTo(200, 200);
                ctx.lineTo(230, 250);
                ctx.stroke();
                break; // Правая нога
            case 7:
                alertGameOver(false);
                break; // Проигрыш
        }
    }
    function updateWordDisplay() {
        wordDisplay.innerHTML = selectedWord
            .split("")
            .map(function (letter) { return guessedLetters.includes(letter) ? letter : "_"; })
            .join(" ");
        if (!wordDisplay.innerText.includes("_")) {
            alertGameOver(true);
        }
    }
    function generateLetters() {
        lettersContainer.innerHTML = "";
        var alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ";
        var _loop_1 = function (letter) {
            var btn = document.createElement("span");
            btn.classList.add("letter");
            btn.textContent = letter;
            btn.addEventListener("click", function () { return handleLetterClick(letter, btn); });
            lettersContainer.appendChild(btn);
        };
        for (var _i = 0, alphabet_1 = alphabet; _i < alphabet_1.length; _i++) {
            var letter = alphabet_1[_i];
            _loop_1(letter);
        }
    }
    function handleLetterClick(letter, btn) {
        if (guessedLetters.includes(letter) || wrongGuesses >= maxMistakes)
            return;
        if (selectedWord.includes(letter)) {
            guessedLetters.push(letter);
            btn.classList.add("correct");
        }
        else {
            wrongGuesses++;
            btn.classList.add("wrong");
            drawHangman();
        }
        updateWordDisplay();
    }
    function alertGameOver(won) {
        setTimeout(function () {
            alert(won ? "Поздравляем! Вы угадали слово!" : "\u0412\u044B \u043F\u0440\u043E\u0438\u0433\u0440\u0430\u043B\u0438! \u0417\u0430\u0433\u0430\u0434\u0430\u043D\u043D\u043E\u0435 \u0441\u043B\u043E\u0432\u043E: ".concat(selectedWord));
            restartButton.style.display = "block";
        }, 500);
    }
    restartButton.addEventListener("click", function () {
        restartButton.style.display = "none";
        startGame();
    });
    loadWords();
};
