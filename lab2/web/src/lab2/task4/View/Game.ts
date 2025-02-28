import {GameDocument} from '../Document/GameDocument'
import {DesignMode, DesignToggle} from './DesignToggle'
import {Gallows} from './Gallows'
import {GameMenu} from './GameMenu'
import {GuessedLetters} from './GuessedLetters'
import {LettersInput} from './LettersInput'
import {Renderer} from './Renderer'

class Game implements Renderer {
	private readonly toggle: DesignToggle
	private readonly menu: GameMenu
	private readonly gallows: Gallows
	private readonly letters: GuessedLetters
	private readonly lettersInputField: LettersInput

	private designMode: DesignMode = 'gallows'

	constructor(
		private readonly gameDocument: GameDocument,
		ctx: CanvasRenderingContext2D,
	) {
		this.toggle = new DesignToggle(mode => this.onDesignChange(mode))

		this.menu = new GameMenu(gameDocument)
		this.gallows = new Gallows(ctx, gameDocument)
		this.letters = new GuessedLetters()
		this.lettersInputField = new LettersInput(gameDocument)

		this.gameDocument.registerListener(state => this.gallows.notify(state))
		this.gameDocument.registerListener(state => this.letters.notify(state))
		this.gameDocument.registerListener(state => this.lettersInputField.notify(state))

		this.gameDocument.newGame()
	}

	render(): void {
		this.toggle.render()
		if (this.designMode === 'menu') {
			this.menu.show()
			this.gallows.hide()
		}
		if (this.designMode === 'gallows') {
			this.menu.hide()
			this.gallows.show()
		}
		this.letters.render()
		this.lettersInputField.render()
	}

	onDesignChange(mode: DesignMode) {
		this.designMode = mode
		this.render()
	}
}
export {
	Game,
}