import type { BuildOptions, Plugin } from "esbuild";

import { CWD } from "../../constants";
import { readFile, resolveModulePath } from "../../helpers";

import type { TSConfig } from "./typescript";

export type EsbuildConfig = Required<
	Pick<BuildOptions, "external" | "format" | "outfile" | "platform">
> & {
	isProduction: boolean;
	source: string;
	tsConfig: TSConfig | null;
};

export const getEsbuildConfig = ({
	external,
	format,
	isProduction,
	outfile,
	platform,
	source,
	tsConfig,
}: EsbuildConfig): BuildOptions => ({
	absWorkingDir: CWD,
	bundle: true,
	color: true,
	define: {
		"process.env.NODE_ENV": isProduction ? '"production"' : '"development"',
	},
	entryPoints: [source],
	external,
	format,
	loader: {
		".gif": "dataurl",
		".jpeg": "dataurl",
		// Data URI is used by default to include a web resource without needing to make an HTTP request (as it can be with file loader for example):
		".jpg": "dataurl",
		".png": "dataurl",
		".svg": "dataurl",
		".webp": "dataurl",
	},
	logLevel: "silent",
	metafile: true,
	minify: isProduction,
	outfile,
	platform,
	plugins: [jsxPlugin(tsConfig)],
	sourcemap: true,
	target: tsConfig?.target ?? "esnext",
	treeShaking: true,
});

/**
 * Plugin to automatically inject React import for jsx management
 * ESBuild doesn't support `jsx` tsconfig field: this plugin aims to add a tiny wrapper to support it
 * We could use the `inject` ESBuild feature but it will break the tree shaking behavior since the React import will
 * be imported on each file (even in .ts file) leading React being included in the bundle even if not needed.
 * @param tsConfig - TypeScript configuration.
 * @returns Plugin.
 * @see https://github.com/evanw/esbuild/issues/334
 * @example
 * jsxPlugin(tsConfig)
 */
const jsxPlugin = (tsConfig: TSConfig | null): Plugin => ({
	name: "jsx-runtime",
	setup(build) {
		build.onLoad({ filter: /\.(j|t)sx$/ }, async ({ path }) => {
			// Enable plugin only if
			// - `${module}/jsx-runtime` package is available (for js project, it's the only condition to check!)
			// - if ts project: jsx compilerOption === "react-jsx" or "react-jsxdev"
			if (!tsConfig?.hasJsxRuntime) return;

			const module = tsConfig.jsxImportSource ?? "react";

			if (!resolveModulePath(`${module}/jsx-runtime`)) {
				throw new Error(
					"Unable to find the JSX runtime.\nPotential solutions:\n1. If you rely on a non React runtime, set a valid `jsxImportSource` in your tsconfig\n2. Make sure that you've installed your project dependencies",
				);
			}

			const content = await readFile(path, "utf8");

			return {
				contents: `import * as React from "${module}";${content}`,
				loader: "tsx",
			};
		});
	},
});
