import type { Plugin } from "esbuild";
import { readFile, resolveModulePath } from "../helpers";
import type { TypeScriptConfiguration } from "./typescript";

/**
 * Plugin to automatically inject React import for jsx management
 * ESBuild doesn't support `jsx` tsconfig field: this plugin aims to add a tiny wrapper to support it
 * We could use the `inject` ESBuild feature but it will break the tree shaking behavior since the React import will
 * be imported on each file (even in .ts file) leading React being included in the bundle even if not needed
 * @see: https://github.com/evanw/esbuild/issues/334
 * @param tsConfig
 * @returns Plugin
 */
export const jsxPlugin = (
	tsConfig: TypeScriptConfiguration | null
): Plugin => ({
	name: "jsx-runtime",
	setup(build) {
		build.onLoad({ filter: /\.(j|t)sx$/ }, async ({ path }) => {
			// Enable plugin only if
			// - `${module}/jsx-runtime` package is available (for js project, it's the only condition to check!)
			// - if ts project: jsx compilerOption === "react-jsx" or "react-jsxdev"
			if (!tsConfig || !tsConfig.hasJsxRuntime) return;

			const module = tsConfig.jsxImportSource || "react";

			if (!resolveModulePath(`${module}/jsx-runtime`)) {
				throw new Error(
					"Unable to find the JSX runtime.\nPotential solutions:\n1. If you rely on a non React runtime, set a valid `jsxImportSource` in your tsconfig\n2. Make sure that you've installed your project dependencies"
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
