import {Drawer} from './Drawer'

class App {
	private readonly canvas: HTMLCanvasElement
	private readonly ctx: CanvasRenderingContext2D
	private readonly drawer: Drawer

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
		this.drawer = new Drawer(ctx)

		this.setupEventListeners()
	}

	run = () => {
		this.render()
	}

	private setupEventListeners() {
		window.addEventListener('resize', this.resizeCanvas)
	}

	private resizeCanvas = () => {
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight
		this.render()
	}

	private render = () => {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

		this.drawer.drawLine({x: 25, y: 100}, {x: 175, y: 100}, {r: 0, g: 1, b: 0})
		this.drawer.drawLine({x: 25, y: 100}, {x: 50, y: 50}, {r: 0, g: 1, b: 0})
		this.drawer.drawLine({x: 50, y: 50}, {x: 150, y: 50}, {r: 0, g: 1, b: 0})
		this.drawer.drawLine({x: 150, y: 50}, {x: 175, y: 100}, {r: 0, g: 1, b: 0})
		this.drawer.drawLine({x: 25, y: 100}, {x: 25, y: 125}, {r: 0, g: 1, b: 0})
		this.drawer.drawLine({x: 175, y: 100}, {x: 175, y: 125}, {r: 0, g: 1, b: 0})
		this.drawer.drawLine({x: 25, y: 125}, {x: 175, y: 125}, {r: 0, g: 0, b: 0})

		this.drawer.fillCircle({x: 60, y: 130}, 15, {r: 0, g: 0, b: 0})
		this.drawer.fillCircle({x: 140, y: 130}, 15, {r: 0, g: 0, b: 0})
		this.drawer.drawCircle({x: 60, y: 130}, 15, {r: 0.5, g: 0, b: 0.7})
		this.drawer.drawCircle({x: 140, y: 130}, 15, {r: 0.5, g: 0, b: 0.7})

		requestAnimationFrame(this.render)
	}
}

const app = new App()
app.run()

export {
}