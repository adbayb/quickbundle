import { resolve } from "node:path";

import { CWD } from "../../constants";
import { assert } from "../../helpers";

type PackageMetadata = {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	main: string;
	module?: string;
	peerDependencies?: Record<string, string>;
	platform?: "browser" | "node";
	source: string;
	types?: string;
};

export const getPkgConfig = () => {
	const {
		dependencies = {},
		main,
		module,
		peerDependencies = {},
		platform = "browser",
		source,
		types,
		// eslint-disable-next-line @typescript-eslint/no-var-requires
	} = require(resolve(CWD, "package.json")) as PackageMetadata;

	assert(
		main,
		"A `main` field is required in `package.json`. Did you forget to add it?",
	);

	assert(
		source,
		"A `source` field is required in `package.json`. Did you forget to add it?",
	);

	assert(
		["browser", "node"].includes(platform),
		"The `platform` package field can only accept `browser` or `node` value.",
	);

	const externalDependencies = [
		...Object.keys(peerDependencies),
		...Object.keys(dependencies),
	];

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
