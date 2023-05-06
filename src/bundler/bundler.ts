import { context, formatMessages } from "esbuild";
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

export const watch = async (
	onWatch: (type: "loading" | "result", error?: string) => void
) => {
	const { esbuild, pkg, typescript } = await getConfigs({
		isProduction: false,
	});
	const defaultTarget = pkg.hasModule ? "esm" : "cjs";

	const ctx = await context({
		...esbuild({
			format: defaultTarget,
			outfile: pkg.destination[defaultTarget] as string,
		}),
		plugins: [
			{
				name: "onBuildEnd",
				setup(build) {
					build.onStart(() => {
						onWatch("loading");
					});
					build.onEnd(async (result) => {
						const error = (
							await formatMessages(result.errors, {
								kind: "error",
								color: true,
								terminalWidth: 100,
							})
						).join("\n");

						// If there's already a build error, no need to run
						// a heavy typing generation process until the error is fixed
						if (!error && typescript.isEnabled) {
							buildDts({
								source: pkg.source,
								destination: pkg.types as string,
							})
								.then(() => {
									onWatch("result");
								})
								.catch((err) => {
									onWatch("result", err);
								});
						} else {
							onWatch("result", error);
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
