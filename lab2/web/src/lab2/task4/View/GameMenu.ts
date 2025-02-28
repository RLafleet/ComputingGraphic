import {GameDocument, DocumentState} from '../Document/GameDocument'
import {Notifiable} from './Notifiable'
import {Renderer} from './Renderer'

class GameMenu implements Renderer, Notifiable {
	private readonly container: HTMLDivElement
	private readonly usedLettersContainer: HTMLDivElement
	private readonly attemptsElement: HTMLParagraphElement

	constructor(
		private readonly gameDocument: GameDocument,
	) {
		this.container = document.createElement('div')
		this.usedLettersContainer = document.createElement('div')
		this.attemptsElement = document.createElement('p')

		this.setupContainer()
		this.gameDocument.registerListener(this.notify.bind(this))
	}

	show(): void {
		this.container.style.display = 'flex'
		this.render()
	}

	hide(): void {
		this.container.style.display = 'none'
	}

	render(): void {
	}

	notify(gameState: DocumentState): void {
		this.updateUsedLetters(gameState)
		this.updateAttemptsCounter(gameState)
	}

	private setupContainer(): void {
		this.container.style.display = 'flex'
		this.container.style.flexDirection = 'column'
		this.container.style.gap = '15px'
		this.container.style.padding = '20px'
		this.container.style.border = '1px solid #ddd'
		this.container.style.borderRadius = '8px'

		const title = document.createElement('h3')
		title.textContent = 'Статус игры'
		title.style.margin = '0 0 10px 0'

		this.usedLettersContainer.style.display = 'flex'
		this.usedLettersContainer.style.flexWrap = 'wrap'
		this.usedLettersContainer.style.gap = '5px'

		this.attemptsElement.style.fontSize = '1.2em'
		this.attemptsElement.style.margin = '0'

		this.container.append(
			title,
			this.createInfoBlock('Осталось попыток:', this.attemptsElement),
			this.createInfoBlock('Использованные буквы:', this.usedLettersContainer),
		)

		document.body.appendChild(this.container)
	}

	private createInfoBlock(label: string, content: HTMLElement): HTMLDivElement {
		const block = document.createElement('div')
		block.style.display = 'flex'
		block.style.flexDirection = 'column'
		block.style.gap = '5px'

		const labelElement = document.createElement('span')
		labelElement.textContent = label
		labelElement.style.fontWeight = 'bold'

		block.appendChild(labelElement)
		block.appendChild(content)
		return block
	}

	private updateUsedLetters(state: DocumentState): void {
		this.usedLettersContainer.innerHTML = ''

		state.usedLetters.forEach(letter => {
			const isCorrect = state.guessedLetters.some(g => g.char === letter)
			const letterElement = document.createElement('div')

			letterElement.textContent = letter
			letterElement.style.padding = '5px 10px'
			letterElement.style.borderRadius = '4px'
			letterElement.style.backgroundColor = isCorrect ? '#4CAF50' : '#FF5252'
			letterElement.style.color = 'white'
			letterElement.style.fontWeight = 'bold'
			letterElement.style.transition = 'all 0.3s ease'

			this.usedLettersContainer.appendChild(letterElement)
		})
	}

	private updateAttemptsCounter(state: DocumentState): void {
		const remainingAttempts = this.gameDocument.getMaxMistakesCount() - state.mistakes
		this.attemptsElement.textContent = `${remainingAttempts} из 7`
		this.attemptsElement.style.color = remainingAttempts <= 2 ? '#FF5252' : '#4CAF50'
	}
}

export {GameMenu}