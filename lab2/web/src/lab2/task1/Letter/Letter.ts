import {Color} from './Color'
import {IDrawable} from './IDrawable'
import {Position} from './Position'
import {IDrawStrategy} from './Strategy/DrawStrategy'

class Letter implements IDrawable {
	constructor(
		private m_position: Position,
		private m_color: Color,
		private m_drawStrategy: IDrawStrategy,
	) {
	}

	setPosition(position: Position): void {
		this.m_position = position
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.m_drawStrategy.draw(ctx, this.m_position, this.m_color)
	}
}

export {
	Letter,
}