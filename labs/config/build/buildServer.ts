import {BuildOptions} from './types/config'
import {ServerOptions} from 'vite'

const buildServer = (args: BuildOptions): ServerOptions => ({
	port: args.port,
	open: args.open,
})

export {
	buildServer,
}