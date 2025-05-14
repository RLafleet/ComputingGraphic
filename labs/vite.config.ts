import * as path from 'path'
// @ts-expect-error
import url from 'url'
import {ConfigEnv} from 'vite'
import {buildViteConfig} from './config/build/buildViteConfig'
import {BuildMode, BuildPaths} from './config/build/types/config'

// @ts-expect-error
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const labName = process.env.VITE_LAB || 'lab6'
const taskName = process.env.VITE_TASK || 'task2'

export default (configEnv: ConfigEnv) => {
	const mode = (configEnv.mode ?? 'development') as BuildMode
	const isDev = mode === 'development'
	const paths: BuildPaths = {
		outDir: path.resolve(__dirname, 'dist'),
		entry: path.resolve(__dirname, 'src', labName, taskName, 'index.html'),
	}

	return buildViteConfig({
		minify: !isDev,
		open: true,
		port: 3000,
		root: path.resolve(__dirname, 'src', labName, taskName),
		paths,
	})
}