import {Color, Position, Size} from './types'

class Wires {
	constructor(
		private position: Position,
		private size: Size,
		private color: Color,
	) {
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = `rgb(${this.color.r * 255}, ${this.color.g * 255}, ${this.color.b * 255})`

		ctx.lineWidth = 2
		ctx.beginPath()
		ctx.moveTo(this.position.x, this.position.y)
		ctx.lineTo(this.position.x + this.size.width, this.position.y)
		ctx.stroke()
		ctx.beginPath()
		ctx.moveTo(this.position.x, this.position.y + this.size.height)
		ctx.lineTo(this.position.x + this.size.width, this.position.y + this.size.height)
		ctx.stroke()
	}

	getPosition(): Position {
		return this.position
	}

	getSize(): Size {
		return this.size
	}
}

export {
	Wires,
}