/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve } from "path";
import { CWD } from "../constants";

type PackageMetadata = {
	main: string;
	module: string;
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
		source,
	}: PackageMetadata = require(resolve(CWD, "package.json"));
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
			esm: module,
		},
		externalDependencies,
		hasModule(name: string) {
			// @note: Reading dependencies metadata from package.json instead of using `require.resolve` mechanism
			// is more suited to avoid side effect on monorepo where packages resolution can leak to other packages
			return allDependencies.includes(name);
		},
	} as const;
};
