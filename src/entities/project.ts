/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve } from "path";
import { CWD } from "../constants";
import { assert } from "../helpers";

type PackageMetadata = {
	main: string;
	module?: string;
	platform?: "node" | "browser";
	source: string;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
};

export type Project = ReturnType<typeof createProject>;

export const createProject = () => {
	const {
		dependencies = {},
		devDependencies = {},
		peerDependencies = {},
		main,
		module,
		platform = "browser",
		source,
	}: PackageMetadata = require(resolve(CWD, "package.json"));

	assert(
		main,
		"A `main` field is required in `package.json`. Did you forget to add it?"
	);

	assert(
		source,
		"A `source` field is required in `package.json`. Did you forget to add it?"
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
		destination: {
			cjs: main,
			...(module && { esm: module as string }),
		},
		externalDependencies,
		platform,
		hasModule(name: string) {
			// @note: Reading dependencies metadata from package.json instead of using `require.resolve` mechanism
			// is more suited to avoid side effect on monorepo where packages resolution can leak to other packages
			return allDependencies.includes(name);
		},
	} as const;
};
