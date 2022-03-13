import gzipSize from "gzip-size";
import { Termost } from "termost";
import { bundle } from "../../bundler";
import { readFile } from "../../helpers";

interface BuildCommandContext {
	sizes: Array<{ filename: string; raw: number; gzip: number }>;
	outfiles: Array<string>;
}

export const createBuildCommand = (program: Termost<BuildCommandContext>) => {
	program
		.command({
			name: "build",
			description: "Build the source code in production mode",
		})
		.task({
			key: "outfiles",
			label: "Bundle assets 📦",
			async handler() {
				return await bundle({
					isProduction: true,
				});
			},
		})
		.task({
			key: "sizes",
			label: "Compute sizes 🔢",
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
