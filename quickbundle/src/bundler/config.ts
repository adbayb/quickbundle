import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import url from "@rollup/plugin-url";
import { createRequire } from "node:module";
import { join } from "node:path";
import type { InputPluginOption, RollupOptions } from "rollup";
import dts from "rollup-plugin-dts";
import externals from "rollup-plugin-node-externals";
import { swc } from "rollup-plugin-swc3";

// TODO: configurable minification/source maps (CLI flag, by default false since the build tool focuses on lib and source maps/minification process should be an application concern)

const require = createRequire(import.meta.url);
const PKG = require(join(process.cwd(), "./package.json")) as PackageJson;

type PackageJson = {
	exports?: Record<string, EntryPoints>;
	main?: string;
	module?: string;
	types?: string;
};

type EntryPoints =
	| string
	| {
			import?: string;
			require?: string;
			source?: string;
			types?: string;
	  };

export type Configuration = RollupOptions;

const createConfigurations = (): Configuration[] => {
	/**
	 * Entry-point resolution:
	 * Following the [package entry-point specification](https://nodejs.org/api/packages.html#package-entry-points),
	 * whenever an export object is defined, it take precedence over other classical entry-point fields
	 * (such as main, module, and types defined at the root package.json level).
	 */
	if (PKG.main ?? PKG.module ?? PKG.types ?? !PKG.exports) {
		throw new Error(
			"Invalid package entry points contract. Use the recommended [`exports` field](https://nodejs.org/api/packages.html#package-entry-points) instead and configure the TypeScript configuration to resolve it properly (`moduleResolution` must be set to `Bundler` (or `NodeNext`)).",
		);
	}

	const outputEntryPointFields = ["import", "require", "types"];

	return Object.entries(PKG.exports).flatMap(([name, entryPoints]) => {
		if (typeof entryPoints === "string") return [];

		const entryPointKeys = Object.keys(entryPoints);

		if (entryPointKeys.includes("source")) {
			const hasAtLeastOneRequiredField = outputEntryPointFields.some(
				(field) => entryPointKeys.includes(field),
			);

			if (!hasAtLeastOneRequiredField) {
				throw new Error(
					`A \`source\` field is defined without a provided \`${name}\` module entry point. Make sure to define at least one entry point (including ${outputEntryPointFields.join(
						", ",
					)})`,
				);
			}
		}

		return [
			entryPoints.source &&
				createMainConfig({
					...entryPoints,
					source: entryPoints.source,
				}),
			entryPoints.source &&
				entryPoints.types &&
				createTypesConfig({
					source: entryPoints.source,
					types: entryPoints.types,
				}),
		].filter(Boolean) as Configuration;
	});
};

const getPlugins = (...customPlugins: InputPluginOption[]) => {
	return [
		externals({
			builtins: true,
			deps: true,
			/**
			 * As they're not installed consumer side, `devDependencies` are declared as internal dependencies (via the `false` value)
			 * and bundled into the dist if and only if imported and not listed as `peerDependencies` (otherwise, they're considered external).
			 */
			devDeps: false,
			optDeps: true,
			peerDeps: true,
		}),
		nodeResolve({
			/**
			 * The `exports` conditional fields definition order is important in the `package.json file`.
			 * To be resolved first, `types` field must always come first in the package.json exports definition.
			 * @see https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#package-json-exports-imports-and-self-referencing.
			 */
			exportConditions: ["types"],
		}),
		commonjs(),
		url(),
		json(),
		...customPlugins,
	];
};

const createMainConfig = (
	entryPoints: Partial<Pick<EntryPoints, "import" | "require">> &
		Required<Pick<EntryPoints, "source">>,
): Configuration => {
	const output = [
		entryPoints.require && {
			file: entryPoints.require,
			format: "cjs",
			sourcemap: false,
		},
		entryPoints.import && {
			file: entryPoints.import,
			format: "es",
			sourcemap: false,
		},
	].filter(Boolean) as NonNullable<Configuration["output"]>;

	return {
		input: entryPoints.source,
		output,
		plugins: getPlugins(
			swc({
				/**
				 * Minification and source maps generation are disabled to delegate such responsibility to the application bundler.
				 * Indeed, The responsibility of the library bundler should be only about generating an unoptimized bundle and instructing the application about its build context
				 * especially on how to eliminate its dead code (tree shaking) with hints like with `sideEffects` package flag and pure comment annotations.
				 */
				minify: false,
				sourceMaps: false,
			}),
		),
	};
};

const createTypesConfig = (
	entryPoints: Required<Pick<EntryPoints, "source" | "types">>,
): Configuration => {
	return {
		input: entryPoints.source,
		output: [{ file: entryPoints.types }],
		plugins: getPlugins(
			dts({
				compilerOptions: {
					incremental: false,
				},
				respectExternal: true,
			}),
		),
	};
};

// eslint-disable-next-line import/no-default-export
export default createConfigurations();
