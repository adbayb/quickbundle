import { BuildOptions, build as buildFromEsbuild, context } from "esbuild";
import { CWD } from "../constants";
import { ModuleFormat } from "../types";
import { getPackageMetadata } from "./package";
import { jsxPlugin } from "./plugins";
import {
	generateTypeScriptDeclaration,
	getTypeScriptConfiguration,
	hasTypeScript,
} from "./typescript";

export const build = async () => {
	const { esbuild, pkg, typescript } = await getConfiguration({
		isProduction: true,
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
		...(typescript.isEnabled
			? [
					generateTypeScriptDeclaration({
						source: pkg.source,
						destination: pkg.types as string,
					}),
			  ]
			: []),
	];

	return Promise.all(promises);
};

export const watch = async (onWatch: (error?: string) => void) => {
	const { esbuild, pkg, typescript } = await getConfiguration({
		isProduction: false,
	});

	const ctx = await context({
		...esbuild({ format: "cjs", outfile: pkg.destination["cjs"] }),
		plugins: [
			{
				name: "onBuildEnd",
				setup(build) {
					build.onEnd((result) => {
						const error = result.errors.join("\n");

						// If there's already a build error, no need to run
						// a heavy typing generation process until the error is fixed
						if (!error && typescript.isEnabled) {
							generateTypeScriptDeclaration({
								source: pkg.source,
								destination: pkg.types as string,
							})
								.then(() => {
									onWatch();
								})
								.catch((err) => {
									onWatch(err);
								});
						} else {
							onWatch(error);
						}
					});
				},
			},
		],
	});

	await ctx.watch();
};

type ConfigurationOptions = {
	isProduction: boolean;
};

const getConfiguration = async ({ isProduction }: ConfigurationOptions) => {
	const {
		destination,
		externalDependencies,
		hasModule,
		platform,
		source,
		types,
	} = getPackageMetadata();
	const tsConfig = await getTypeScriptConfiguration();
	const hasTyping = typeof types === "string" && hasTypeScript(tsConfig);

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
