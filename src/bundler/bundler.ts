import { BuildOptions, build as buildFromEsbuild } from "esbuild";
// import { ServerResponse } from "http";
import { CWD } from "../constants";
import { ModuleFormat } from "../types";
import { getPackageMetadata } from "./package";
import { jsxPlugin } from "./plugins";
import {
	generateTypeScriptDeclaration,
	getTypeScriptConfiguration,
} from "./typescript";

type Options = Pick<InternalOptions, "isFast" | "isProduction">;

type InternalOptions = {
	isFast: boolean;
	isLiveReload: boolean;
	isProduction: boolean;
};

export const build = async ({ isFast, isProduction }: Options) => {
	const { esbuild, pkg, typescript } = await getConfiguration({
		isFast,
		isProduction,
		isLiveReload: false,
	});

	const getType = async () => {
		const outfile = pkg.types;

		if (!outfile) return null;

		await generateTypeScriptDeclaration(outfile);

		return outfile;
	};

	const getJavaScript = async (format: ModuleFormat) => {
		const outfile = pkg.destination[format];

		if (!outfile) return null;

		await buildFromEsbuild(esbuild({ format, outfile }));

		return outfile;
	};

	/*
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

	isWatching && getJavaScript(hasModule ? "esm" : "cjs")

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
	*/

	const promises = [
		getJavaScript("cjs"),
		...(pkg.hasModule ? [getJavaScript("esm")] : []),
		...(typescript.isEnabled ? [getType()] : []),
	];

	return Promise.all(promises);
};

const getConfiguration = async ({
	isFast,
	isLiveReload,
	isProduction,
}: InternalOptions) => {
	const {
		destination,
		externalDependencies,
		hasModule,
		platform,
		source,
		types,
	} = getPackageMetadata();
	const hasTyping = typeof types === "string" && !isFast;
	const tsConfig = await getTypeScriptConfiguration();

	const esbuild = ({
		format,
		outfile,
	}: Required<Pick<BuildOptions, "format" | "outfile">>): BuildOptions => ({
		...(isLiveReload && {
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
	});

	return {
		esbuild,
		pkg: {
			hasModule,
			destination,
			types,
		},
		typescript: {
			configuration: tsConfig,
			isEnabled: hasTyping,
		},
	};
};

// @note: array of clients to support live reload on mutiple tabs/windows
// const clients: Array<ServerResponse> = [];
const servePort = 9000;
