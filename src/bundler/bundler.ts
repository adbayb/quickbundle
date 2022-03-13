/* eslint-disable sonarjs/cognitive-complexity */
import path from "path";
import { build } from "esbuild";
import { helpers } from "termost";
import { CWD } from "../constants";
import { ModuleFormat } from "../types";
import { getMetadata } from "./metadata";
import { jsxPlugin } from "./plugins";
import { getTypeScriptConfiguration } from "./typescript";

type BundlerOptions = {
	isProduction: boolean;
	onWatch: (error: Error | null) => void;
};

export const bundle = async ({
	isProduction = false,
	onWatch,
}: Partial<BundlerOptions>) => {
	const { destination, externalDependencies, platform, source, types } =
		getMetadata();
	const isWatchMode = typeof onWatch === "function";
	const isTypingRequested = typeof types === "string";
	const tsConfig = await getTypeScriptConfiguration();

	const getType = async () => {
		const outfile = types;

		if (!outfile) {
			throw new Error("No typing output file has been set");
		}

		try {
			const typingDir = path.dirname(outfile);

			await helpers.exec(
				`tsc --declaration --emitDeclarationOnly --incremental --outDir ${typingDir}`,
				{ cwd: CWD }
			);
		} catch (error) {
			throw new Error(`Typing generation failed:\n${error}`);
		}

		return outfile;
	};

	const getJavaScript = async (format: ModuleFormat) => {
		const outfile = destination[format];

		if (!outfile) {
			throw new Error(
				`No output file has been set for \`${format}\` format`
			);
		}

		await build({
			absWorkingDir: CWD,
			bundle: Boolean(externalDependencies),
			define: {
				"process.env.NODE_ENV": isProduction
					? '"production"'
					: '"development"',
			},
			entryPoints: [source],
			external: externalDependencies,
			format,
			logLevel: "silent",
			metafile: true,
			minify: isProduction,
			outfile,
			plugins: [jsxPlugin(tsConfig)],
			platform,
			sourcemap: true,
			target: tsConfig?.target || "esnext",
			treeShaking: true,
			watch: isWatchMode && {
				async onRebuild(bundleError) {
					let error: Error | null = bundleError as Error;

					// @note: early return => if there's already a build error,
					// no need to run a heavy typing generation process until the error is fixed
					if (error) {
						onWatch(error);

						return;
					}

					if (isTypingRequested) {
						try {
							await getType();
						} catch (typingError) {
							error = typingError as Error;
						}
					}

					onWatch(error);
				},
			},
		});

		return outfile;
	};

	const promises = [
		// @todo: check if module is set. If not, do not call it and use only cjs one.
		getJavaScript("esm"),
		...(!isWatchMode ? [getJavaScript("cjs")] : []),
		...(isTypingRequested ? [getType()] : []),
	];

	return Promise.all(promises);
};
