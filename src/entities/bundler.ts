import { Plugin, build } from "esbuild";
import { CWD } from "../constants";
import { readFile, resolveModulePath } from "../helpers";
import { Project } from "./project";
import { TypeScriptConfiguration, getTypeScriptOptions } from "./typescript";

type BundlerOptions = {
	isProduction: boolean;
	isWatchMode: boolean;
	onWatch: (error: Error | null) => void;
};

export const createBundler = async (
	project: Project,
	{
		isProduction = false,
		isWatchMode = false,
		onWatch,
	}: Partial<BundlerOptions>
) => {
	const tsOptions = await getTypeScriptOptions();

	return async (format: "esm" | "cjs") => {
		const outfile = project.destination[format];

		if (!outfile) {
			return Promise.reject(
				"Unknown `destination` for the given `format`"
			);
		}

		await build({
			absWorkingDir: CWD,
			bundle: true,
			define: {
				"process.env.NODE_ENV": isProduction
					? '"production"'
					: '"development"',
			},
			entryPoints: [project.source],
			external: project.externalDependencies,
			format,
			metafile: true,
			minify: isProduction,
			outfile,
			plugins: [jsxPlugin(project, tsOptions)],
			platform: project.platform,
			sourcemap: true,
			target: tsOptions?.target || "esnext",
			watch: isWatchMode && {
				onRebuild: onWatch,
			},
		});

		return outfile;
	};
};

const jsxPlugin = (
	project: Project,
	tsOptions: TypeScriptConfiguration | null
): Plugin => ({
	// @note: Plugin to automatically inject React import for jsx management
	// ESBuild doesn't support `jsx` tsconfig field: this plugin aims to add a tiny wrapper to support it
	// We could use the `inject` ESBuild feature but it will break the tree shaking behavior since the React import will
	// be imported on each file (even in .ts file) leading React being included in the bundle even if not needed
	name: "jsx",
	setup(build) {
		build.onLoad({ filter: /\.(j|t)sx$/ }, async ({ path }) => {
			const module = ["preact", "react"].find(project.hasModule);

			// @note: enable plugin only if
			// - `${module}/jsx-runtime` package is available (for js project, it's the only condition to check!)
			// - if ts project: jsx compilerOption === "react-jsx" or "react-jsxdev"
			if (
				!module ||
				!resolveModulePath(`${module}/jsx-runtime`) ||
				tsOptions?.hasJsxRuntime === false
			) {
				return;
			}

			const content: string = await readFile(path, "utf8");

			return {
				contents: `import * as React from "${module}";${content}`,
				loader: "jsx",
			};
		});
	},
});
