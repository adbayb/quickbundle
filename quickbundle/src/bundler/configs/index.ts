import type { BuildOptions } from "esbuild";

import { getEsbuildConfig } from "./esbuild";
import type { EsbuildConfig } from "./esbuild";
import { getPkgConfig } from "./package";
import { getTSConfig } from "./typescript";

type ConfigOptions = {
	isProduction: boolean;
};

export const getConfigs = ({ isProduction }: ConfigOptions) => {
	const {
		destination,
		externalDependencies,
		hasModule,
		platform,
		source,
		types,
	} = getPkgConfig();

	const tsConfig = getTSConfig();
	const hasTyping = typeof types === "string" && Boolean(tsConfig);

	const esbuild = ({
		format,
		outfile,
	}: Pick<EsbuildConfig, "format" | "outfile">): BuildOptions =>
		getEsbuildConfig({
			external: externalDependencies,
			format,
			isProduction,
			outfile,
			platform,
			source,
			tsConfig,
		});

	return {
		esbuild,
		pkg: {
			destination,
			hasModule,
			source,
			types,
		},
		typescript: {
			configuration: tsConfig,
			isEnabled: hasTyping,
		},
	};
};
