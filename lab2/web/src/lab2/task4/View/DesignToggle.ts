import {Renderer} from './Renderer'

type DesignMode = 'gallows' | 'menu'
type DesignChangeCallback = (mode: DesignMode) => void

class DesignToggle implements Renderer {
	private readonly container: HTMLDivElement

	constructor(
		private readonly onDesignChange: DesignChangeCallback,
	) {
		this.container = document.createElement('div')
		this.container.style.display = 'grid'
		this.container.style.gridTemplateColumns = 'repeat(2, 1fr)'
		this.container.style.gap = '5px'
		this.container.style.margin = '20px'
		document.body.appendChild(this.container)

		this.createToggle()
	}

	render(): void {
	}

	private createToggle(): void {
		const modes: DesignMode[] = ['gallows', 'menu']

		modes.forEach(mode => {
			const button = document.createElement('button')
			button.textContent = this.getModeLabel(mode)
			button.style.padding = '10px'
			button.style.borderRadius = '5px'
			button.style.cursor = 'pointer'

			button.addEventListener('click', () => {
				this.onDesignChange(mode)
				this.updateButtonStyles(button)
			})

			this.container.appendChild(button)
		})
	}

	private getModeLabel(mode: DesignMode): string {
		return {
			gallows: 'Виселица',
			menu: 'Меню',
		}[mode]
	}

	private updateButtonStyles(activeButton: HTMLButtonElement): void {
		Array.from(this.container.children).forEach(child => {
			if (child instanceof HTMLButtonElement) {
				child.style.backgroundColor = child === activeButton ? '#4CAF50' : '#f0f0f0'
				child.style.color = child === activeButton ? 'white' : 'black'
			}
		})
	}
}

export {
	DesignToggle,
}

export type {
	DesignMode,
}