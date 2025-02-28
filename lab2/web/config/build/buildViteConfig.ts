import {UserConfig} from 'vite'
import {buildBuild} from './buildBuild'
import {buildServer} from './buildServer'
import {BuildOptions} from './types/config'

const buildViteConfig = (args: BuildOptions): UserConfig => ({
	root: args.root,
	build: buildBuild(args),
	server: buildServer(args),
})

export {
	buildViteConfig,
}