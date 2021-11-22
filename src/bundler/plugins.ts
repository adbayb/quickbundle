import type { Plugin } from "esbuild";
import { readFile, resolveModulePath } from "../helpers";
import type { TypeScriptConfiguration } from "./typescript";

export const jsxPlugin = (
	dependencies: Array<string>,
	tsOptions: TypeScriptConfiguration | null
): Plugin => ({
	// @note: Plugin to automatically inject React import for jsx management
	// ESBuild doesn't support `jsx` tsconfig field: this plugin aims to add a tiny wrapper to support it
	// We could use the `inject` ESBuild feature but it will break the tree shaking behavior since the React import will
	// be imported on each file (even in .ts file) leading React being included in the bundle even if not needed
	name: "jsx",
	setup(build) {
		build.onLoad({ filter: /\.(j|t)sx$/ }, async ({ path }) => {
			const module = ["preact", "react"].find((module) =>
				dependencies.includes(module)
			);

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
				loader: "tsx",
			};
		});
	},
});
