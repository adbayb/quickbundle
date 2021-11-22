import { build } from "esbuild";
import { helpers } from "termost";
import { CWD } from "../constants";
import { ModuleFormat } from "../types";
import { Metadata } from "./metadata";
import { jsxPlugin } from "./plugins";
import { getTypeScriptOptions } from "./typescript";

type BundlerOptions = {
	isProduction: boolean;
	isWatchMode: boolean;
	onWatch: (error: Error | null) => void;
};

export const createBundler = async (
	metadata: Metadata,
	{
		isProduction = false,
		isWatchMode = false,
		onWatch,
	}: Partial<BundlerOptions>
) => {
	const tsOptions = await getTypeScriptOptions();

	const bundleTyping = () => {
		const { types: typingOutput } = metadata;

		if (!tsOptions || !typingOutput) return;

		console.log("PASSE", typingOutput);
	};

	return async (format: ModuleFormat) => {
		const outfile = metadata.destination[format];

		if (!outfile) {
			return Promise.reject(
				"Unknown `destination` for the given `format`"
			);
		}

		await build({
			absWorkingDir: CWD,
			bundle: Boolean(metadata.externalDependencies),
			define: {
				"process.env.NODE_ENV": isProduction
					? '"production"'
					: '"development"',
			},
			entryPoints: [metadata.source],
			external: metadata.externalDependencies,
			format,
			metafile: true,
			minify: isProduction,
			outfile,
			plugins: [jsxPlugin(metadata.allDependencies, tsOptions)],
			platform: metadata.platform,
			sourcemap: true,
			target: tsOptions?.target || "esnext",
			watch: isWatchMode && {
				onRebuild(error) {
					if (typeof onWatch === "function") {
						onWatch(error);
					}

					if (!error) {
						bundleTyping();
					}
				},
			},
		});

		bundleTyping();

		return outfile;
	};
};
