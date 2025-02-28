import {GameDocument} from './Document/GameDocument'
import {Game} from './View/Game'

class App {
	private readonly canvas: HTMLCanvasElement
	private readonly ctx: CanvasRenderingContext2D
	private readonly game: Game

	constructor() {
		this.canvas = document.createElement('canvas')
		document.body.appendChild(this.canvas)
		this.canvas.width = 400
		this.canvas.height = 400
		const ctx = this.canvas.getContext('2d')

		if (!ctx) {
			throw new Error('Canvas 2D context not supported')
		}
		this.ctx = ctx

		const gameDocument = new GameDocument()
		this.game = new Game(gameDocument, ctx)
	}

	run = () => {
		this.render()
	}

	private render = () => {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

		this.game.render()
	}
}

const app = new App()
app.run()

export {}