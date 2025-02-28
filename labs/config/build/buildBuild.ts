import {BuildOptions as ViteBuildOptions} from 'vite'
import {BuildOptions} from './types/config'

const buildBuild = (args: BuildOptions): ViteBuildOptions => ({
	minify: args.minify,
	rollupOptions: {
		input: {
			app: args.paths.entry,
		},
	},
	outDir: args.paths.outDir,
})

export {
	buildBuild,
}