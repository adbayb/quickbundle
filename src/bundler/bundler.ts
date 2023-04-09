import { context } from "esbuild";
import { Thread, Worker, spawn } from "threads";
import { ModuleFormat } from "../types";
import { writeFile } from "../helpers";
import { getConfigs } from "./configs";

export const build = async () => {
	const { pkg, typescript } = await getConfigs({
		isProduction: true,
	});

	const promises = [
		buildJavaScript("cjs"),
		...(pkg.hasModule ? [buildJavaScript("esm")] : []),
		...(typescript.isEnabled
			? [
					buildDts({
						source: pkg.source,
						destination: pkg.types as string,
					}),
			  ]
			: []),
	];

	return Promise.all(promises);
};

export const watch = async (onWatch: (error?: string) => void) => {
	const { esbuild, pkg, typescript } = await getConfigs({
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
							buildDts({
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

const buildJavaScript = async (format: ModuleFormat) => {
	const worker = await spawn(new Worker("./workers/esbuild"));
	const outfile = await worker(format);

	await Thread.terminate(worker);

	return outfile;
};

const buildDts = async ({
	source,
	destination,
}: {
	source: string;
	destination: string;
}) => {
	try {
		const worker = await spawn(new Worker("./workers/dts"));
		const dtsContent = await worker(source);

		await writeFile(destination, dtsContent);
		await Thread.terminate(worker);

		return destination;
	} catch (error) {
		throw new Error(`Type generation failed:\n${error}`);
	}
};
