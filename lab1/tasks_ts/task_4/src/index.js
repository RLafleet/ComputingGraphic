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
var _this = this;
var HangmanCanvas = /** @class */ (function () {
    function HangmanCanvas(canvas) {
        this.canvas = canvas;
        this.theme = "classic";
        this.ctx = canvas.getContext("2d");
        this.canvas.width = 300;
        this.canvas.height = 400;
    }
    HangmanCanvas.prototype.setTheme = function (theme) {
        this.theme = theme;
        this.drawGallows();
    };
    HangmanCanvas.prototype.getThemeColor = function () {
        switch (this.theme) {
            case "dark": return "white";
            case "cartoon": return "blue";
            default: return "black";
        }
    };
    HangmanCanvas.prototype.drawGallows = function () {
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
    };
    HangmanCanvas.prototype.drawHangman = function (stage) {
        this.ctx.strokeStyle = this.getThemeColor();
        switch (stage) {
            case 1:
                this.ctx.beginPath();
                this.ctx.arc(200, 100, 20, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
            case 2:
                this.ctx.moveTo(200, 120);
                this.ctx.lineTo(200, 200);
                this.ctx.stroke();
                break;
            case 3:
                this.ctx.moveTo(200, 140);
                this.ctx.lineTo(170, 180);
                this.ctx.stroke();
                break;
            case 4:
                this.ctx.moveTo(200, 140);
                this.ctx.lineTo(230, 180);
                this.ctx.stroke();
                break;
            case 5:
                this.ctx.moveTo(200, 200);
                this.ctx.lineTo(170, 250);
                this.ctx.stroke();
                break;
            case 6:
                this.ctx.moveTo(200, 200);
                this.ctx.lineTo(230, 250);
                this.ctx.stroke();
                break;
        }
    };
    return HangmanCanvas;
}());
var WordManager = /** @class */ (function () {
    function WordManager() {
        this.words = [];
    }
    WordManager.prototype.loadWords = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetch("words.json")];
                    case 1:
                        response = _b.sent();
                        _a = this;
                        return [4 /*yield*/, response.json()];
                    case 2:
                        _a.words = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WordManager.prototype.getRandomWord = function () {
        var randomIndex = Math.floor(Math.random() * this.words.length);
        return this.words[randomIndex];
    };
    return WordManager;
}());
var HangmanGame = /** @class */ (function () {
    function HangmanGame(wordDisplay, lettersContainer, hintElement, restartButton, canvas, wordManager) {
        var _this = this;
        this.wordDisplay = wordDisplay;
        this.lettersContainer = lettersContainer;
        this.hintElement = hintElement;
        this.restartButton = restartButton;
        this.canvas = canvas;
        this.wordManager = wordManager;
        this.selectedWord = "";
        this.hint = "";
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.maxMistakes = 7;
        this.restartButton.addEventListener("click", function () { return _this.startGame(); });
    }
    HangmanGame.prototype.startGame = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wordData;
            return __generator(this, function (_a) {
                wordData = this.wordManager.getRandomWord();
                this.selectedWord = wordData.word.toUpperCase();
                this.hint = wordData.hint;
                this.guessedLetters = [];
                this.wrongGuesses = 0;
                this.hintElement.textContent = "\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430: ".concat(this.hint);
                this.canvas.drawGallows();
                this.updateWordDisplay();
                this.generateLetters();
                this.restartButton.style.display = "none";
                return [2 /*return*/];
            });
        });
    };
    HangmanGame.prototype.updateWordDisplay = function () {
        var _this = this;
        this.wordDisplay.innerHTML = this.selectedWord
            .split("")
            .map(function (letter) { return _this.guessedLetters.includes(letter) ? letter : "_"; })
            .join(" ");
        if (!this.wordDisplay.innerText.includes("_")) {
            this.alertGameOver(true);
        }
    };
    HangmanGame.prototype.generateLetters = function () {
        var _this = this;
        this.lettersContainer.innerHTML = "";
        var alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
        var _loop_1 = function (letter) {
            var btn = document.createElement("span");
            btn.classList.add("letter");
            btn.textContent = letter;
            btn.addEventListener("click", function () { return _this.handleLetterClick(letter, btn); });
            this_1.lettersContainer.appendChild(btn);
        };
        var this_1 = this;
        for (var _i = 0, alphabet_1 = alphabet; _i < alphabet_1.length; _i++) {
            var letter = alphabet_1[_i];
            _loop_1(letter);
        }
    };
    HangmanGame.prototype.handleLetterClick = function (letter, btn) {
        if (this.guessedLetters.includes(letter) || this.wrongGuesses >= this.maxMistakes)
            return;
        if (this.selectedWord.includes(letter)) {
            this.guessedLetters.push(letter);
            btn.classList.add("correct");
        }
        else {
            this.wrongGuesses++;
            btn.classList.add("wrong");
            this.canvas.drawHangman(this.wrongGuesses);
        }
        this.updateWordDisplay();
    };
    HangmanGame.prototype.alertGameOver = function (won) {
        var _this = this;
        setTimeout(function () {
            alert(won ? "Поздравляем! Вы угадали слово!" : "\u0412\u044B \u043F\u0440\u043E\u0438\u0433\u0440\u0430\u043B\u0438! \u0417\u0430\u0433\u0430\u0434\u0430\u043D\u043D\u043E\u0435 \u0441\u043B\u043E\u0432\u043E: ".concat(_this.selectedWord));
            _this.restartButton.style.display = "block";
        }, 500);
    };
    return HangmanGame;
}());
var ThemeManager = /** @class */ (function () {
    function ThemeManager(themeSelector, canvas) {
        var _this = this;
        this.themeSelector = themeSelector;
        this.canvas = canvas;
        this.themeSelector.addEventListener("change", function (e) {
            var target = e.target;
            _this.applyTheme(target.value);
        });
    }
    ThemeManager.prototype.applyTheme = function (theme) {
        document.body.classList.remove("classic", "dark", "cartoon");
        document.body.classList.add(theme);
        this.canvas.setTheme(theme);
    };
    return ThemeManager;
}());
window.onload = function () { return __awaiter(_this, void 0, void 0, function () {
    var canvasElement, wordDisplay, lettersContainer, hintElement, restartButton, themeSelector, canvas, wordManager, game, themeManager;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                canvasElement = document.getElementById("canvas");
                wordDisplay = document.getElementById("word-display");
                lettersContainer = document.getElementById("letters");
                hintElement = document.getElementById("hint");
                restartButton = document.getElementById("restart");
                themeSelector = document.getElementById("theme");
                canvas = new HangmanCanvas(canvasElement);
                wordManager = new WordManager();
                return [4 /*yield*/, wordManager.loadWords()];
            case 1:
                _a.sent();
                game = new HangmanGame(wordDisplay, lettersContainer, hintElement, restartButton, canvas, wordManager);
                themeManager = new ThemeManager(themeSelector, canvas);
                game.startGame();
                return [2 /*return*/];
        }
    });
}); };
