import gzipSize from "gzip-size";
import { Termost } from "termost";
import { Metadata, createBundler, getMetadata } from "../../bundler";
import { readFile } from "../../helpers";
import { ModuleFormat } from "../../types";

interface BuildContext {
	metadata: Metadata;
	sizes: Array<{ filename: string; raw: number; gzip: number }>;
	outfiles: Array<string>;
}

export const createBuildCommand = (program: Termost<BuildContext>) => {
	program
		.command({
			name: "build",
			description: "Build the source code in production mode",
		})
		.task({
			key: "metadata",
			label: "Retrieve information ⚙️",
			async handler() {
				return getMetadata();
			},
		})
		.task({
			key: "outfiles",
			label: ({ values }) =>
				`Transpile to ${Object.keys(values.metadata.destination).join(
					", "
				)} bundles 👷‍♂️`,
			async handler({ values }) {
				const targets = Object.keys(
					values.metadata.destination
				) as Array<ModuleFormat>;
				const bundle = await createBundler(values.metadata, {
					isProduction: true,
				});

				return await Promise.all(
					targets.map((target) => bundle(target))
				);
			},
		})
		.task({
			key: "sizes",
			label: "Compute size 📐",
			async handler({ values }) {
				return await calculateBundleSize(values.outfiles);
			},
		})
		.message({
			handler({ values }, helpers) {
				const padding =
					values.sizes
						.map((item) => item.raw)
						.reduce((pad: number, currentRawSize: number) => {
							return Math.max(pad, String(currentRawSize).length);
						}, 0) + 2;

				values.sizes.forEach((item) => {
					helpers.print(
						[
							`${item.raw.toString().padStart(padding)} B raw`,
							`${item.gzip.toString().padStart(padding)} B gz`,
						],
						{
							label: item.filename,
							type: "information",
						}
					);
				});
			},
		});
};

const calculateBundleSize = async (filenames: string[]) => {
	const calculateFileSize = async (filename: string) => {
		const content = await readFile(filename);
		const gzSize = await gzipSize(content);

		return {
			filename,
			raw: content.byteLength,
			gzip: gzSize,
		};
	};

	return await Promise.all(
		filenames.map((filename) => calculateFileSize(filename))
	);
};
