import {Letter} from './Letter/Letter'
import {DrawStrategyB, DrawStrategyL, DrawStrategyTC} from './Letter/Strategy/DrawStrategy'

type LetterData = {
	letter: Letter,
	phase: number,
}

class App {
	private readonly canvas: HTMLCanvasElement
	private readonly ctx: CanvasRenderingContext2D
	private readonly amplitude = 50
	private readonly period = 2000
	private readonly letterSpacing = 100
	private readonly letters: LetterData[] = [
		{
			letter: new Letter({x: 0, y: 0}, {r: 1, g: 0, b: 0}, new DrawStrategyTC()),
			phase: 0,
		},
		{
			letter: new Letter({x: 0, y: 0}, {r: 0, g: 1, b: 0}, new DrawStrategyB()),
			phase: Math.PI / 3,
		},
		{
			letter: new Letter({x: 0, y: 0}, {r: 0, g: 0, b: 1}, new DrawStrategyL()),
			phase: (2 * Math.PI) / 3,
		},
	]

	constructor() {
		this.canvas = document.createElement('canvas')
		document.body.appendChild(this.canvas)
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight
		const ctx = this.canvas.getContext('2d')

		if (!ctx) {
			throw new Error('Canvas 2D context not supported')
		}

		this.ctx = ctx

		window.addEventListener('resize', this.resizeCanvas)
	}

	run = () => {
		this.render()
	}

	private resizeCanvas = () => {
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight
		this.render()
	}

	private render = () => {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

		const centerX = this.canvas.width / 2
		const centerY = this.canvas.height / 2

		const time = Date.now()

		this.letters.forEach((letterData, index) => {
			const {letter, phase} = letterData
			const offsetY = this.amplitude * Math.sin((2 * Math.PI * time) / this.period + phase)
			letter.setPosition({
				x: centerX + (index - 1) * this.letterSpacing,
				y: centerY + offsetY,
			})

			letter.draw(this.ctx)
		})

		requestAnimationFrame(this.render)
	}
}

const app = new App()
app.run()
