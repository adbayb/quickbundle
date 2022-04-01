/* eslint-disable sonarjs/cognitive-complexity */
import { build } from "esbuild";
import { CWD } from "../constants";
import { ModuleFormat } from "../types";
import { getPackageMetadata } from "./package";
import { jsxPlugin } from "./plugins";
import {
	generateTypeScriptDeclaration,
	getTypeScriptConfiguration,
} from "./typescript";

type BundleParameters = {
	isProduction: boolean;
	isFast: boolean;
	onWatch?: (error: Error | null) => void;
};

export const bundle = async ({
	isProduction,
	isFast,
	onWatch,
}: BundleParameters) => {
	const {
		destination,
		externalDependencies,
		hasModule,
		platform,
		source,
		types,
	} = getPackageMetadata();
	const isWatching = typeof onWatch === "function";
	const isTypingRequested = typeof types === "string" && !isFast;
	const tsConfig = await getTypeScriptConfiguration();

	const getType = async () => {
		const outfile = types;

		if (!outfile) return null;

		await generateTypeScriptDeclaration(outfile);

		return outfile;
	};

	const getJavaScript = async (format: ModuleFormat) => {
		const outfile = destination[format];

		if (!outfile) return null;

		await build({
			absWorkingDir: CWD,
			bundle: true,
			define: {
				"process.env.NODE_ENV": isProduction
					? '"production"'
					: '"development"',
			},
			entryPoints: [source],
			external: externalDependencies,
			format,
			loader: {
				".jpg": "file",
				".jpeg": "file",
				".png": "file",
				".gif": "file",
				".svg": "file",
				".webp": "file",
			},
			logLevel: "silent",
			metafile: true,
			minify: isProduction,
			outfile,
			plugins: [jsxPlugin(tsConfig)],
			platform,
			sourcemap: true,
			target: tsConfig?.target || "esnext",
			treeShaking: true,
			watch: isWatching && {
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
		...(isWatching
			? [getJavaScript(hasModule ? "esm" : "cjs")]
			: [getJavaScript("cjs"), getJavaScript("esm")]),
		...(isTypingRequested ? [getType()] : []),
	];

	return Promise.all(promises);
};
