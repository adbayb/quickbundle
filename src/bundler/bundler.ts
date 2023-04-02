import { BuildOptions, build as buildFromEsbuild, context } from "esbuild";
import { CWD } from "../constants";
import { ModuleFormat } from "../types";
import { getPackageMetadata } from "./package";
import { jsxPlugin } from "./plugins";
import {
	generateTypeScriptDeclaration,
	getTypeScriptConfiguration,
} from "./typescript";

type Options = {
	isFast: boolean;
	isProduction: boolean;
};

export const build = async ({ isFast, isProduction }: Options) => {
	const { esbuild, pkg, typescript } = await getConfiguration({
		isFast,
		isProduction,
	});

	const buildJavaScript = async (format: ModuleFormat) => {
		const outfile = pkg.destination[format];

		if (!outfile) return null;

		await buildFromEsbuild(esbuild({ format, outfile }));

		return outfile;
	};

	const promises = [
		buildJavaScript("cjs"),
		...(pkg.hasModule ? [buildJavaScript("esm")] : []),
		...(typescript.isEnabled ? [buildTypes(pkg.types)] : []),
	];

	return Promise.all(promises);
};

export const watch = async ({ isFast, isProduction }: Options) => {
	const { esbuild, pkg, typescript } = await getConfiguration({
		isFast,
		isProduction,
	});

	const ctx = await context({
		...esbuild({ format: "cjs", outfile: pkg.destination["cjs"] }),
		plugins: [
			{
				name: "on-end",
				setup(build) {
					build.onEnd((result) => {
						console.log(
							`A build ended with ${result.errors.length} errors`
						);

						let error = result.errors.join("\n");

						// @note: if there's already a build error, no need to run
						// a heavy typing generation process until the error is fixed
						if (!error && typescript.isEnabled) {
							buildTypes(pkg.types).catch((err) => {
								error = String(err);
							});
						}

						console.log("errors", JSON.stringify(error));

						// onWatch(error);
					});
				},
			},
		],
	});

	await ctx.watch();
};

const buildTypes = async (outfile: string | undefined) => {
	if (!outfile) return null;

	await generateTypeScriptDeclaration(outfile);

	return outfile;
};

const getConfiguration = async ({ isFast, isProduction }: Options) => {
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
