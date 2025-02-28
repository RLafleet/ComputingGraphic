import {DocumentState} from '../Document/GameDocument'
import {Notifiable} from './Notifiable'
import {Renderer} from './Renderer'

class GuessedLetters implements Renderer, Notifiable {
	private state: DocumentState | undefined
	private readonly container: HTMLDivElement

	constructor() {
		this.container = document.createElement('div')
		this.container.style.display = 'grid'
		this.container.style.gridTemplateColumns = 'repeat(8, 1fr)'
		this.container.style.gap = '10px'
		this.container.style.margin = '20px'
		document.body.appendChild(this.container)
	}

	render(): void {
		if (!this.state) {
			return
		}

		this.container.innerHTML = ''
		const wordArray = Array(this.state.wordLength).fill('')

		for (const answer of this.state.guessedLetters) {
			wordArray[answer.wordIndex] = answer.char
		}

		wordArray.forEach((char, _) => {
			const div = document.createElement('div')
			div.textContent = char
			div.style.fontSize = '24px'
			div.style.textAlign = 'center'
			div.style.borderBottom = '2px solid #000'
			div.style.width = '30px'
			this.container.appendChild(div)
		})

		const hint = document.createElement('div')
		hint.textContent = `Подсказка: ${this.state.hint}`
		hint.style.gridColumn = '1 / -1'
		hint.style.textAlign = 'center'
		hint.style.marginTop = '20px'
		this.container.appendChild(hint)
	}

	notify(gameState: DocumentState): void {
		this.state = gameState
		this.render()
	}
}

export {
	GuessedLetters,
}