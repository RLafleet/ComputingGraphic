import {Color} from '../Color'
import {Position} from '../Position'

type IDrawStrategy = {
	draw: (ctx: CanvasRenderingContext2D, position: Position, color: Color) => void,
}

class DrawStrategyTC implements IDrawStrategy {
	draw(ctx: CanvasRenderingContext2D, position: Position, color: Color): void {
		ctx.fillStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`

		ctx.fillRect(position.x - 20, position.y - 50, 10, 100)
		ctx.fillRect(position.x + 10, position.y - 50, 10, 100)

		ctx.fillRect(position.x - 20, position.y + 40, 55, 10)
		ctx.fillRect(position.x + 35, position.y + 40, 10, 30)
	}
}

class DrawStrategyB implements IDrawStrategy {
	draw(ctx: CanvasRenderingContext2D, position: Position, color: Color): void {
		ctx.fillStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`

		ctx.fillRect(position.x - 20, position.y - 50, 10, 100)

		ctx.fillRect(position.x - 10, position.y + 40, 28, 10)
		ctx.fillRect(position.x - 10, position.y - 5, 28, 10)
		ctx.fillRect(position.x - 10, position.y - 50, 28, 10)

		ctx.fillRect(position.x + 10, position.y - 45, 10, 40)
		ctx.fillRect(position.x + 10, position.y, 10, 40)
	}
}

class DrawStrategyL implements IDrawStrategy {
	draw(ctx: CanvasRenderingContext2D, position: Position, color: Color): void {
		ctx.strokeStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`
		ctx.lineWidth = 10
		ctx.lineCap = 'round'

		ctx.beginPath()
		ctx.moveTo(position.x - 25, position.y + 40)
		ctx.lineTo(position.x, position.y - 40)
		ctx.stroke()

		ctx.beginPath()
		ctx.lineTo(position.x, position.y - 40)
		ctx.lineTo(position.x + 25, position.y + 40)
		ctx.stroke()
	}
}

export type {
	IDrawStrategy,
}

export {
	DrawStrategyTC,
	DrawStrategyB,
	DrawStrategyL,
}
