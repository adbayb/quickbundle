import { context, formatMessages } from "esbuild";
import { Thread, Worker, spawn } from "threads";

import { writeFile } from "../helpers";
import type { ModuleFormat } from "../types";

import { getConfigs } from "./configs";

export const build = async () => {
	const { pkg, typescript } = getConfigs({
		isProduction: true,
	});

	const promises = [
		buildJavaScript("cjs"),
		...(pkg.hasModule ? [buildJavaScript("esm")] : []),
		...(typescript.isEnabled
			? [
					buildDts({
						destination: pkg.types as string,
						source: pkg.source,
					}),
				]
			: []),
	];

	return Promise.all(promises);
};

export const watch = async (
	onWatch: (type: "loading" | "result", error?: string) => void,
) => {
	const { esbuild, pkg, typescript } = getConfigs({
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
				setup(callbacks) {
					callbacks.onStart(() => {
						onWatch("loading");
					});
					callbacks.onEnd(async (result) => {
						const error = (
							await formatMessages(result.errors, {
								color: true,
								kind: "error",
								terminalWidth: 100,
							})
						).join("\n");

						// If there's already a build error, no need to run
						// a heavy typing generation process until the error is fixed
						if (!error && typescript.isEnabled) {
							buildDts({
								destination: pkg.types as string,
								source: pkg.source,
							})
								.then(() => {
									onWatch("result");
								})
								.catch((err) => {
									onWatch("result", String(err));
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
	const outfile = (await worker(format)) as string | null;

	await Thread.terminate(worker);

	return outfile;
};

const buildDts = async ({
	destination,
	source,
}: {
	destination: string;
	source: string;
}) => {
	try {
		const worker = await spawn(new Worker("./workers/dts"));
		const dtsContent = (await worker(source)) as string;

		await writeFile(destination, dtsContent);
		await Thread.terminate(worker);

		return destination;
	} catch (error) {
		throw new Error(`Type generation failed:\n${String(error)}`);
	}
};
