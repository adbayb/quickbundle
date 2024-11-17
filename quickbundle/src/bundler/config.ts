import { createRequire } from "node:module";

import { swc } from "rollup-plugin-swc3";
import externals from "rollup-plugin-node-externals";
import dts from "rollup-plugin-dts";
import type { InputPluginOption, RollupOptions } from "rollup";
import url from "@rollup/plugin-url";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";

import { resolveFromExternalDirectory } from "../helpers";
import { isRecord } from "./helpers";

const require = createRequire(import.meta.url);

const PKG = require(
	resolveFromExternalDirectory("package.json"),
) as PackageJson;

type PackageJson = {
	name?: string;
	bin?: Record<string, string> | string;
	exports?: BuildableExport | Record<string, BuildableExport | string>;
	main?: string;
	module?: string;
	source?: string;
	types?: string;
};

type BuildableExport = {
	bin?: string;
	default?: string;
	import?: string;
	require?: string;
	source?: string;
	types?: string;
};

type Options = {
	minification: boolean;
	sourceMaps: boolean;
	standalone: boolean;
};

type ConfigurationItem = RollupOptions;

export type Configuration = {
	data: ConfigurationItem[];
	metadata: BuildableExport[];
};

const DEFAULT_OPTIONS: Options = {
	minification: false,
	sourceMaps: false,
	standalone: false,
};

export const createConfiguration = (
	options: Options = DEFAULT_OPTIONS,
): Configuration => {
	const buildableExports = getBuildableExports(options);

	return {
		data: buildableExports.flatMap((buildableExport) => {
			return [
				buildableExport.source &&
					createMainConfig(
						{
							...buildableExport,
							source: buildableExport.source,
						},
						options,
					),
				buildableExport.source &&
					buildableExport.types &&
					createTypesConfig(
						{
							source: buildableExport.source,
							types: buildableExport.types,
						},
						options,
					),
			].filter(Boolean) as Configuration["data"];
		}),
		metadata: buildableExports,
	};
};

// eslint-disable-next-line sonarjs/cyclomatic-complexity
const getBuildableExports = ({ standalone }: Options): BuildableExport[] => {
	if (standalone) {
		/**
		 * Entry-point resolution invariants for standalone target (mostly binaries).
		 */
		if (!PKG.source || !PKG.bin || !PKG.name) {
			throw new Error(
				"Invalid package entry points contract. Standalone compilation is enabled but required fields are missing. Make sure to set `name`, `source`, and `bin` fields.",
			);
		}

		const bin = PKG.bin;
		const name = PKG.name;
		const source = PKG.source;

		if (isRecord(bin)) {
			return Object.entries(bin).map((data) => ({
				bin: data[0],
				require: data[1],
				source,
			}));
		}

		return [
			{
				// For scoped packages and if the `bin` is defined with a string value, the [scope name is discarded](the scope name is discarded when creating a binary) when creating a binary.
				bin: name.replace(/^(@.*?\/)/, ""),
				require: bin,
				source,
			},
		];
	}

	/**
	 * Entry-point resolution invariants for non-standalone target (mostly libraries):
	 * Following the [package entry-point specification](https://nodejs.org/api/packages.html#package-entry-points),
	 * whenever an export object is defined, it take precedence over other classical entry-point fields
	 * (such as main, module, and types defined at the root package.json level).
	 */
	if (PKG.main || PKG.module || PKG.types || !PKG.exports) {
		throw new Error(
			"Invalid package entry points contract. Use the recommended [`exports` field](https://nodejs.org/api/packages.html#package-entry-points) instead and, for TypeScript-based projects, update the `tsconfig.json` file to resolve it properly (`moduleResolution` must be set to `Bundler` (or `NodeNext`)).",
		);
	}

	const buildableExportFields = ["default", "import", "require", "types"];
	let singleExport: BuildableExport | undefined = undefined;

	const output = Object.entries(PKG.exports)
		.map(([field, value]) => {
			if (isRecord(value)) {
				return [field, value] as const;
			}

			if (["source", ...buildableExportFields].includes(field)) {
				if (!singleExport) {
					singleExport = {};

					singleExport[field as keyof BuildableExport] = value;

					return [".", singleExport] as const;
				}

				singleExport[field as keyof BuildableExport] = value;
			}

			return undefined;
		})
		.reduce<BuildableExport[]>((buildableExports, currentExport) => {
			if (!currentExport) return buildableExports;

			const [exportField, exportValue] = currentExport;
			const conditionalExportFields = Object.keys(exportValue);

			if (!conditionalExportFields.includes("source")) return buildableExports;

			const hasAtLeastOneRequiredField = buildableExportFields.some(
				(entryPointField) => conditionalExportFields.includes(entryPointField),
			);

			if (hasAtLeastOneRequiredField) {
				buildableExports.push(exportValue);

				return buildableExports;
			}

			throw new Error(
				`A \`source\` field is defined without an output defined for the \`${exportField}\` export. Make sure to define at least one conditional entry point (including ${buildableExportFields
					.map((field) => `\`${field}\``)
					.join(", ")})`,
			);
		}, []);

	if (output.length === 0) {
		throw new Error(
			"No `source` field is set for the targeted package. If a build step is necessary, make sure to configure at least one `source` field in the package `exports` contract. If not, do not execute quickbundle on this package.",
		);
	}

	return output;
};

const getPlugins = (customPlugins: InputPluginOption[], options: Options) => {
	return [
		!options.standalone &&
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
		commonjs(),
		url(),
		json(),
		...customPlugins,
	].filter(Boolean);
};

const createMainConfig = (
	entryPoints: Partial<
		Pick<BuildableExport, "default" | "import" | "require">
	> &
		Required<Pick<BuildableExport, "source">>,
	options: Options,
): ConfigurationItem => {
	const { minification, sourceMaps } = options;
	const esmInput = entryPoints.import ?? entryPoints.default;

	if (
		entryPoints.import &&
		entryPoints.default &&
		entryPoints.import !== entryPoints.default
	) {
		throw new Error(
			"Both `import` and `default` export fields have been defined but with different values. To preserve proper `default` field resolution on the consumer side (i.e. to target ESM format), make sure to provide the same file path for both fields.",
		);
	}

	const output = [
		entryPoints.require && {
			file: entryPoints.require,
			format: "cjs",
			inlineDynamicImports: Boolean(options.standalone),
			sourcemap: sourceMaps,
		},
		esmInput && {
			file: esmInput,
			format: "es",
			sourcemap: sourceMaps,
		},
	].filter(Boolean) as NonNullable<ConfigurationItem["output"]>;

	return {
		input: entryPoints.source,
		output,
		plugins: getPlugins(
			[
				nodeResolve(),
				swc({
					minify: minification,
					sourceMaps,
				}),
			],
			options,
		),
	};
};

const createTypesConfig = (
	entryPoints: Required<Pick<BuildableExport, "source" | "types">>,
	options: Options,
): ConfigurationItem => {
	return {
		input: entryPoints.source,
		output: [{ file: entryPoints.types }],
		plugins: getPlugins(
			[
				nodeResolve({
					/**
					 * The `exports` conditional fields definition order is important in the `package.json file`.
					 * To be resolved first, `types` field must always come first in the package.json exports definition.
					 * @see https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#package-json-exports-imports-and-self-referencing.
					 */
					exportConditions: ["types"],
				}),
				dts({
					compilerOptions: {
						incremental: false,
					},
					respectExternal: true,
				}),
			],
			options,
		),
	};
};
