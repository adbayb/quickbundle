import { resolve } from "node:path";
import { CWD } from "../../constants";
import { assert } from "../../helpers";

type PackageMetadata = {
	main: string;
	module?: string;
	platform?: "node" | "browser";
	types?: string;
	source: string;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	dependencies?: Record<string, string>;
};

export const getPkgConfig = () => {
	const {
		peerDependencies = {},
		dependencies = {},
		main,
		module,
		platform = "browser",
		source,
		types,
	}: // eslint-disable-next-line @typescript-eslint/no-var-requires
	PackageMetadata = require(resolve(CWD, "package.json"));

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
