import config from './gameConfig.json'

type Letter = string
type WordIndex = number

type GameState = 'playing' | 'over' | 'win'

type GameConfig = {
	words: Word[],
}

type Word = {
	hint: string,
	answer: string,
}

type DocumentState = {
	mistakes: number,
	gameState: GameState,
	wordLength: number,
	guessedLetters: GuessedLetter[],
	hint: string,
	usedLetters: Letter[],
}

type GuessedLetter = {
	char: Letter,
	wordIndex: WordIndex,
}

type DocumentListener = (state: DocumentState) => void

class GameDocument {
	private readonly config: GameConfig
	private currentWord: Word
	private mistakesCount = 0
	private readonly maxMistakes = 7
	private guessedLetters: GuessedLetter[] = []
	private gameState: GameState = 'playing'
	private listeners: DocumentListener[] = []
	private usedLetters: Letter[] = []

	private readonly russianAlphabet: Letter[] = [
		'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М',
		'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ',
		'Ы', 'Ь', 'Э', 'Ю', 'Я',
	]

	constructor() {
		this.config = config as GameConfig
		this.currentWord = this.getRandomWord()
	}

	newGame(): void {
		this.currentWord = this.getRandomWord()
		this.mistakesCount = 0
		this.guessedLetters = []
		this.gameState = 'playing'
		this.usedLetters = []
		this.notifyListeners()
	}

	getAllowedLetters(): Letter[] {
		return [...this.russianAlphabet]
	}

	registerListener(listener: DocumentListener): void {
		this.listeners.push(listener)
	}

	guess(letter: Letter): void {
		if (this.gameState !== 'playing') {
			return
		}

		const normalizedLetter = letter.toLowerCase()

		if (!this.getAllowedLetters().some(l => l.toLowerCase() === normalizedLetter)) {
			throw new Error(`Letter ${letter} is not allowed`)
		}

		if (this.guessedLetters.some(l => l.char.toLowerCase() === normalizedLetter)) {
			throw new Error(`Letter ${letter} was already used`)
		}

		const upperLetter = letter.toUpperCase()
		if (this.usedLetters.includes(upperLetter)) {
			throw new Error(`Letter ${letter} was already used`)
		}

		const isCorrect = this.currentWord.answer.toLowerCase().includes(normalizedLetter)

		if (isCorrect) {
			const indexes = [...this.currentWord.answer]
				.map((char, index) => ({char: char.toLowerCase(), index}))
				.filter(({char}) => char === normalizedLetter)
				.map(({index}) => index)

			this.guessedLetters.push(...indexes.map(index => ({
				char: letter.toUpperCase(),
				wordIndex: index,
			})))
		}
		else {
			this.mistakesCount++
		}

		this.usedLetters.push(upperLetter)
		this.updateGameState()
		this.notifyListeners()
	}

	getMaxMistakesCount(): number {
		return this.maxMistakes
	}

	private getRandomWord(): Word {
		if (this.config.words.length === 0) {
			throw new Error('No words available in configuration')
		}
		const randomIndex = Math.floor(Math.random() * this.config.words.length)
		const word = this.config.words[randomIndex]
		if (!word) {
			throw new Error('No words available in configuration')
		}
		return word
	}

	private updateGameState(): void {
		if (this.checkWinCondition()) {
			this.gameState = 'win'
		}
		else if (this.mistakesCount >= this.maxMistakes) {
			this.gameState = 'over'
		}
	}

	private checkWinCondition(): boolean {
		const uniqueAnswerLetters = new Set(this.currentWord.answer.toLowerCase().split(''))
		const guessedUniqueLetters = new Set(this.guessedLetters.map(gl => gl.char.toLowerCase()))
		return Array.from(uniqueAnswerLetters).every(letter => guessedUniqueLetters.has(letter))
	}

	private notifyListeners(): void {
		const state: DocumentState = {
			mistakes: this.mistakesCount,
			gameState: this.gameState,
			wordLength: this.currentWord.answer.length,
			guessedLetters: this.guessedLetters,
			hint: this.currentWord.hint,
			usedLetters: this.usedLetters,
		}

		this.listeners.forEach(listener => listener(state))
	}
}

export {
	GameDocument,
}

export type {
	DocumentState,
	GuessedLetter,
}