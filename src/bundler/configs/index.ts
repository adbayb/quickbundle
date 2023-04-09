import { BuildOptions } from "esbuild";
import { EsbuildConfig, getEsbuildConfig } from "./esbuild";
import { getPkgConfig } from "./package";
import { getTSConfig } from "./typescript";

type ConfigOptions = {
	isProduction: boolean;
};

export const getConfigs = async ({ isProduction }: ConfigOptions) => {
	const {
		destination,
		externalDependencies,
		hasModule,
		platform,
		source,
		types,
	} = getPkgConfig();
	const tsConfig = await getTSConfig();
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
