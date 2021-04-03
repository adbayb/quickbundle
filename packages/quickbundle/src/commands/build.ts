/* eslint-disable @typescript-eslint/no-var-requires, sonarjs/no-redundant-jump */
import { resolve } from "path";
import { BuildOptions, build } from "esbuild";
import { CWD } from "../constants";
import { run } from "../helpers";

// @todo: invariant/assert checks (if no source field is provided in package.json => error)
// @todo: clean before building (share clean method with the clean command)
// @todo: support externals
// @todo: run tsc to emit declaration file based upon pkgMetadata target

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
			return allDependencies.includes(name);
		},
	} as const;
};

const getInjectPresets = (project: Project): BuildOptions["inject"] => {
	const availablePresets = ["preact", "react"]; // @note: the order is important (search first preact before react)

	for (const preset of availablePresets) {
		if (project.hasModule(preset)) {
			return [
				resolve(__dirname, `../../public/buildPresets/${preset}.js`),
			];
		}
	}

	return;
};

const createBundler = async (project: Project) => {
	const injectPresets = getInjectPresets(project);
	const ts = await import("typescript"); // @note: lazy load typescript only if necessary
	const tsMetadata = ts.parseJsonConfigFileContent(
		require(resolve(CWD, "tsconfig.json")),
		ts.sys,
		CWD
	).options;

	// @todo: prevent issues if no typescript or tsconfig provided
	const tsTarget = tsMetadata.target || ts.ScriptTarget.ESNext;
	// @note: convert ts target value to esbuild ones (latest value is not supported)
	const target = [ts.ScriptTarget.ESNext, ts.ScriptTarget.Latest].includes(
		tsTarget
	)
		? "esnext"
		: ts.ScriptTarget[tsTarget]?.toLowerCase();

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
			tsconfig: "tsconfig.json",
			target,
			format,
			minify: isProduction,
			sourcemap: !isProduction,
			inject: injectPresets,
		});
	};
};

const main = async () => {
	const project = createProject();
	const bundle = await createBundler(project);
	const formats: BundleFormat[] = ["cjs", "esm"];

	for (const format of formats) {
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
