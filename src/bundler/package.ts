/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve } from "path";
import { CWD } from "../constants";
import { assert } from "../helpers";

type PackageOriginalMetadata = {
	main: string;
	module?: string;
	platform?: "node" | "browser";
	types?: string;
	source: string;
	peerDependencies?: Record<string, string>;
};

export const getPackageMetadata = () => {
	const {
		peerDependencies = {},
		main,
		module,
		platform = "browser",
		source,
		types,
	}: PackageOriginalMetadata = require(resolve(CWD, "package.json"));
	const externalDependencies = Object.keys(peerDependencies);

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

	return {
		destination: {
			cjs: main,
			...(module && { esm: module }),
		},
		externalDependencies,
		hasModule: Boolean(module),
		platform,
		source,
		types,
	} as const;
};
