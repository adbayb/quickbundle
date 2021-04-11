/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve } from "path";
import { build } from "esbuild";
import { CWD } from "../constants";
import { readFile } from "../helpers";
import { Project } from "./project";

// @todo: invariant/assert checks (if no source field is provided in package.json => error)
// @todo: support externals

export type BundlerFormat = "esm" | "cjs";

const resolveModulePath = (path: string) => {
	try {
		return Boolean(require.resolve(path, { paths: [CWD] }));
	} catch (error) {
		return false;
	}
};

type TypeScriptConfiguration = {
	target?: string;
	hasJsxRuntime?: boolean;
};

const getTypeScriptOptions = async (): Promise<TypeScriptConfiguration | null> => {
	try {
		const ts = await import("typescript"); // @note: lazy load typescript only if necessary
		const { jsx, target } = ts.parseJsonConfigFileContent(
			require(resolve(CWD, "tsconfig.json")),
			ts.sys,
			CWD
		).options;

		// @todo: prevent issues if no typescript or tsconfig provided
		// @note: convert ts target value to esbuild ones (latest value is not supported)
		const esbuildTarget =
			!target ||
			[ts.ScriptTarget.ESNext, ts.ScriptTarget.Latest].includes(target)
				? "esnext"
				: ts.ScriptTarget[target]?.toLowerCase();

		return {
			target: esbuildTarget,
			hasJsxRuntime:
				jsx !== undefined &&
				[ts.JsxEmit["ReactJSX"], ts.JsxEmit["ReactJSXDev"]].includes(
					jsx
				),
		};
	} catch (error) {
		return null;
	}
};

type BundlerOptions = {
	isProduction: boolean;
	isWatchMode: boolean;
};

export const createBundler = async (
	project: Project,
	{ isProduction, isWatchMode }: BundlerOptions
) => {
	const tsOptions = await getTypeScriptOptions();

	return async (format: BundlerFormat) => {
		const outfile = project.destination[format];

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
			sourcemap: true,
			target: tsOptions?.target || "esnext",
			watch: isWatchMode,
			plugins: [
				{
					// @note: Plugin to automatically inject React import for jsx management
					// ESBuild doesn't support `jsx` tsconfig field: this plugin aims to add a tiny wrapper to support it
					// We could use the `inject` ESBuild feature but it will break the tree shaking behavior since the React import will
					// be imported on each file (even in .ts file) leading React being included in the bundle even if not needed
					name: "jsx",
					setup(build) {
						build.onLoad(
							{ filter: /\.(j|t)sx$/ },
							async ({ path }) => {
								const module = ["preact", "react"].find(
									project.hasModule
								);

								// @note: enable plugin only if
								// - `${module}/jsx-runtime` package is available (for js project, it's the only condition to check!)
								// - if ts project: jsx compilerOption === "react-jsx" or "react-jsxdev"
								if (
									!module ||
									!resolveModulePath(
										`${module}/jsx-runtime`
									) ||
									tsOptions?.hasJsxRuntime === false
								) {
									return;
								}

								const content: string = await readFile(
									path,
									"utf8"
								);

								return {
									contents: `import * as React from "${module}";${content}`,
									loader: "jsx",
								};
							}
						);
					},
				},
			],
		});

		return outfile;
	};
};
