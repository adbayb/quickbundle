/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve } from "path";
import { CWD } from "../constants";
import { assert } from "../helpers";

export const getMetadata = () => {
	const {
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

	return {
		source,
		types,
		destination: {
			cjs: main,
			...(module && { esm: module as string }),
		},
		externalDependencies,
		platform,
	} as const;
};
