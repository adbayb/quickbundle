/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve } from "path";
import { build } from "esbuild";
import { run } from "@adbayb/terminal-kit";
import { CWD } from "../constants";

// @todo: invariant/assert checks (if no source field is provided in package.json => error)
// @todo: support externals

type BundleFormat = "esm" | "cjs";

type PackageMetadata = {
	main: string;
	module: string;
	source: string;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
};

type Project = ReturnType<typeof createProject>;

const createProject = () => {
	const {
		dependencies = {},
		devDependencies = {},
		peerDependencies = {},
		main,
		module,
		source,
	}: PackageMetadata = require(resolve(CWD, "package.json"));
	const allDependencies = [
		...Object.keys(dependencies),
		...Object.keys(devDependencies),
		...Object.keys(peerDependencies),
	];

	// @todo: invariant/asserts for main/module/source

	return {
		source,
		destination: {
			cjs: main,
			esm: module,
		},
		hasModule(name: string) {
			// @note: Reading dependencies metadata from package.json instead of using `require.resolve` mechanism
			// is more suited to avoid side effect on monorepo where packages resolution can leak to other packages
			return allDependencies.includes(name);
		},
	} as const;
};

const resolveModulePath = (path: string) => {
	try {
		return Boolean(require.resolve(path));
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

const createBundler = async (project: Project) => {
	const tsOptions = await getTypeScriptOptions();

	return (format: BundleFormat, isProduction?: boolean) => {
		return build({
			absWorkingDir: CWD,
			bundle: true,
			define: {
				"process.env.NODE_ENV": isProduction
					? '"production"'
					: '"development"',
			},
			entryPoints: [project.source],
			outfile: project.destination[format],
			target: tsOptions?.target || "esnext",
			format,
			minify: isProduction,
			sourcemap: !isProduction,
			plugins: [
				{
					// @note: Plugin to automatically inject React import for jsx management
					// ESBuild doesn't support `jsx` tsconfig field: this plugin aims to add a tiny wrapper to support it
					// We could use the `inject` ESBuild feature but it will break the tree shaking behavior since the React import will
					// be imported on each file (even in .ts file) leading React being included in the bundle even if not needed
					name: "jsx-runtime",
					setup(build) {
						const fs = require("fs");
						// @todo answer https://github.com/evanw/esbuild/issues/334

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

								const content: string = await fs.promises.readFile(
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
	};
};

const main = async () => {
	const project = createProject();
	const bundle = await createBundler(project);
	const formats: BundleFormat[] = ["cjs", "esm"];

	for (const format of formats) {
		// @todo: isProduction true for build command and false for watch command:
		await run(`Building ${format} 👷‍♂️`, bundle(format, false));
	}
};

main();

/*
Only certain `tsconfig` fields are supported by ESBuild:
- baseUrl
- extends
- importsNotUsedAsValues
- jsxFactory
- jsxFragmentFactory
- paths
- useDefineForClassFields
Source: https://esbuild.github.io/content-types/#tsconfig-json

For the `target`/`module`... a mapping is necessary
*/

/*
ESBuild is not intented to make type checking or generate declaration typing file.
For these use cases:
- Declaration: tsc with emitDeclarationOnly (no typing bundle)
- Declaration: https://github.com/timocov/dts-bundle-generator (to bundle typing)
- Check: tsc with noEmit (not needed in watch mode: will only slow down watching process + IDE highlighting is sufficient. Could be used during build and in typing check during pre-commit hook)
*/
