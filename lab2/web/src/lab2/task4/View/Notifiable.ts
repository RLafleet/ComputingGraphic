import {DocumentState} from '../Document/GameDocument'

type Notifiable = {
	notify: (gameState: DocumentState) => void,
}

export type {
	Notifiable,
}