import {DocumentState, GameDocument} from '../Document/GameDocument'
import {Notifiable} from './Notifiable'
import {Renderer} from './Renderer'

class Gallows implements Renderer, Notifiable {
	private state: DocumentState | undefined
	private readonly canvas: HTMLCanvasElement

	constructor(
		private readonly ctx: CanvasRenderingContext2D,
		private readonly gameDocument: GameDocument,
	) {
		this.canvas = ctx.canvas
		document.body.appendChild(this.canvas)
	}

	show(): void {
		this.canvas.style.display = 'block'
		this.render()
	}

	hide(): void {
		this.canvas.style.display = 'none'
	}


	render(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.ctx.strokeStyle = '#000'
		this.ctx.lineWidth = 2

		this.ctx.beginPath()
		this.ctx.moveTo(50, 380)
		this.ctx.lineTo(150, 380)
		this.ctx.lineTo(100, 350)
		this.ctx.lineTo(50, 380)
		this.ctx.stroke()

		this.ctx.beginPath()
		this.ctx.moveTo(100, 350)
		this.ctx.lineTo(100, 50)
		this.ctx.lineTo(250, 50)
		this.ctx.lineTo(250, 100)
		this.ctx.stroke()

		if (!this.state) {
			return
		}

		if (this.state.mistakes > 0) {
			this.drawHead()
		}
		if (this.state.mistakes > 1) {
			this.drawBody()
		}
		if (this.state.mistakes > 2) {
			this.drawLeftArm()
		}
		if (this.state.mistakes > 3) {
			this.drawRightArm()
		}
		if (this.state.mistakes > 4) {
			this.drawLeftLeg()
		}
		if (this.state.mistakes > 5) {
			this.drawRightLeg()
		}
		if (this.state.mistakes > 6) {
			this.drawFace()
		}
	}

	notify(gameState: DocumentState): void {
		this.state = gameState
		this.render()

		if (gameState.gameState === 'win') {
			this.showWin()
		}
		if (gameState.gameState === 'over') {
			this.showGameOver()
		}
	}

	private drawHead() {
		this.ctx.beginPath()
		this.ctx.arc(250, 130, 30, 0, Math.PI * 2)
		this.ctx.stroke()
	}

	private drawBody() {
		this.ctx.beginPath()
		this.ctx.moveTo(250, 160)
		this.ctx.lineTo(250, 260)
		this.ctx.stroke()
	}

	private drawLeftArm() {
		this.ctx.beginPath()
		this.ctx.moveTo(250, 180)
		this.ctx.lineTo(200, 220)
		this.ctx.stroke()
	}

	private drawRightArm() {
		this.ctx.beginPath()
		this.ctx.moveTo(250, 180)
		this.ctx.lineTo(300, 220)
		this.ctx.stroke()
	}

	private drawLeftLeg() {
		this.ctx.beginPath()
		this.ctx.moveTo(250, 260)
		this.ctx.lineTo(200, 320)
		this.ctx.stroke()
	}

	private drawRightLeg() {
		this.ctx.beginPath()
		this.ctx.moveTo(250, 260)
		this.ctx.lineTo(300, 320)
		this.ctx.stroke()
	}

	private drawFace() {
		this.ctx.beginPath()
		this.ctx.moveTo(240, 120)
		this.ctx.lineTo(245, 125)
		this.ctx.moveTo(260, 120)
		this.ctx.lineTo(255, 125)
		this.ctx.moveTo(240, 140)
		this.ctx.arc(250, 140, 10, Math.PI, 0)
		this.ctx.stroke()
	}

	private showWin() {
		setTimeout(() => {
			if (confirm('Победа! Начать заново?')) {
				this.gameDocument.newGame()
			}
		})
	}

	private showGameOver() {
		setTimeout(() => {
			if (confirm('Поражение! Попробовать еще раз?')) {
				this.gameDocument.newGame()
			}
		})
	}
}

export {
	Gallows,
}