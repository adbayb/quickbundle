/* eslint-disable sonarjs/cognitive-complexity */
import { build } from "esbuild";
import { ServerResponse, createServer } from "http";
import { CWD } from "../constants";
import { getAvailablePortFrom, openBrowser } from "../helpers";
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
	serveEntryPoint?: string;
};

export const bundle = async ({
	isProduction,
	isFast,
	onWatch,
	serveEntryPoint,
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
	const isLiveReloadable = serveEntryPoint && isWatching;
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
			...(isLiveReloadable && {
				banner: {
					// @note: insert a custom script to add live reloading capability through server event setup:
					js: `;new EventSource("http://0.0.0.0:${servePort}").onmessage = function() { location.reload(); }; console.log("Live reload ✅ (port: ${servePort})");`,
				},
			}),
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

					if (isLiveReloadable) {
						clients.forEach((client) => {
							client.write("data: update\n\n");
						});
						// @note: clients are cleared since on page reload,
						// the subscription is done again by each client
						clients = [];
					}

					// @note: if there's already a build error, no need to run
					// a heavy typing generation process until the error is fixed
					if (!error && isTypingRequested) {
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

	if (isLiveReloadable) {
		servePort = await getAvailablePortFrom(servePort);
		createServer((_, res) => {
			clients.push(
				res.writeHead(200, {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					"Access-Control-Allow-Origin": "*",
				})
			);
		}).listen(servePort);

		openBrowser(serveEntryPoint);
	}

	const promises = [
		...(isWatching
			? [getJavaScript(hasModule ? "esm" : "cjs")]
			: [getJavaScript("cjs"), getJavaScript("esm")]),
		...(isTypingRequested ? [getType()] : []),
	];

	return Promise.all(promises);
};

// @note: array of clients to support live reload on mutiple tabs/windows
let clients: Array<ServerResponse> = [];
let servePort = 9000;
