type BuildMode = 'development' | 'production'

type BuildPaths = {
	entry: string,
	outDir: string,
}


type BuildOptions = {
	minify: boolean,
	open: boolean,
	port: number,
	root: string,
	paths: BuildPaths,
}

export type {
	BuildMode,
	BuildPaths,
	BuildOptions,
}