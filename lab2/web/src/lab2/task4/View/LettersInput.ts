import {GameDocument, DocumentState} from '../Document/GameDocument'
import {Notifiable} from './Notifiable'
import {Renderer} from './Renderer'

class LettersInput implements Renderer, Notifiable {
	private state: DocumentState | undefined
	private readonly container: HTMLDivElement
	private buttons: HTMLButtonElement[] = []

	constructor(
		private readonly gameDocument: GameDocument,
	) {
		this.container = document.createElement('div')
		this.container.style.display = 'grid'
		this.container.style.gridTemplateColumns = 'repeat(8, 1fr)'
		this.container.style.gap = '5px'
		this.container.style.margin = '20px'
		document.body.appendChild(this.container)

		this.createButtons()
	}

	render(): void {
		this.buttons.forEach(button => {
			button.disabled = false
			button.style.backgroundColor = ''
		})
	}

	notify(gameState: DocumentState): void {
		this.state = gameState
		this.buttons.forEach(button => {
			const letter = button.textContent || ''
			const isUsed = gameState.usedLetters.includes(letter)
			const isCorrect = gameState.guessedLetters.some(g => g.char === letter)

			button.disabled = isUsed || gameState.gameState !== 'playing'
			button.style.backgroundColor = isCorrect
				? '#90EE90'
				: isUsed
					? '#FF7F7F'
					: ''
		})
	}

	private createButtons() {
		this.gameDocument.getAllowedLetters().forEach(char => {
			const button = document.createElement('button')
			button.textContent = char
			button.style.padding = '10px'
			button.style.fontSize = '18px'
			button.addEventListener('click', () => this.handleGuess(char))
			this.buttons.push(button)
			this.container.appendChild(button)
		})
	}

	private handleGuess(char: string) {
		try {
			this.gameDocument?.guess(char)
			this.updateButtonState(char)
		}
		catch (e) {
			console.error(e)
		}
	}

	private updateButtonState(char: string) {
		const button = this.buttons.find(b => b.textContent === char)
		if (!button) {
			return
		}

		const isCorrect = this.state?.guessedLetters.some(a => a.char === char)
		button.style.backgroundColor = isCorrect ? '#90EE90' : '#FF7F7F'
		button.disabled = true
	}
}

export {
	LettersInput,
}