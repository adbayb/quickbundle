/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve } from "path";
import { CWD } from "../constants";
import { assert } from "../helpers";

export type Metadata = ReturnType<typeof getMetadata>;

export const getMetadata = () => {
	const {
		dependencies = {},
		devDependencies = {},
		peerDependencies = {},
		main,
		module,
		platform = "browser",
		source,
		types,
	}: {
		main: string;
		module?: string;
		platform?: "node" | "browser";
		types?: string;
		source: string;
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
		peerDependencies?: Record<string, string>;
	} = require(resolve(CWD, "package.json"));

	assert(
		main,
		"A `main` field is required in `package.json`. Did you forget to add it?"
	);

	assert(
		source,
		"A `source` field is required in `package.json`. Did you forget to add it?"
	);

	assert(
		["browser", "node"].includes(platform),
		"The `platform` package field can only accept `browser` or `node` value."
	);

	const externalDependencies = Object.keys(peerDependencies);
	const allDependencies = [
		...externalDependencies,
		...Object.keys(dependencies),
		...Object.keys(devDependencies),
	];

	// @todo: invariant/asserts for main/module/source
	// @todo: if no types field is added in the package.json => do not create declaration file
	// same if no module/main (main must be required for compatibility purposes)

	return {
		source,
		types,
		destination: {
			cjs: main,
			...(module && { esm: module as string }),
		},
		allDependencies,
		externalDependencies,
		platform,
	} as const;
};
