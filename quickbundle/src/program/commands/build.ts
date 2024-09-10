import gzipSize from "gzip-size";
import { helpers } from "termost";
import type { Termost } from "termost";

import { build } from "../../bundler";
import { readFile } from "../../helpers";

type BuildCommandContext = {
	outfiles: string[];
	sizes: { filename: string; gzip: number; raw: number }[];
};

export const createBuildCommand = (program: Termost) => {
	program
		.command<BuildCommandContext>({
			name: "build",
			description: "Build the source code (production mode)",
		})
		.task({
			key: "outfiles",
			label: "Bundle assets 📦",
			async handler() {
				const outfiles = await build();

				return outfiles.filter(
					(outfile): outfile is string => outfile !== null,
				);
			},
		})
		.task({
			key: "sizes",
			label: "Compute sizes 🔢",
			async handler(context) {
				return calculateBundleSize(context.outfiles);
			},
		})
		.task({
			handler(context) {
				const padding =
					context.sizes
						.map((item) => item.raw)
						.reduce((pad: number, currentRawSize: number) => {
							return Math.max(pad, String(currentRawSize).length);
						}, 0) + 2;

				context.sizes.forEach((item) => {
					helpers.message(
						[
							`${item.raw.toString().padStart(padding)} B raw`,
							`${item.gzip.toString().padStart(padding)} B gz`,
						],
						{
							label: item.filename,
							type: "information",
						},
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
			gzip: gzSize,
			raw: content.byteLength,
		};
	};

	return Promise.all(
		filenames.map(async (filename) => calculateFileSize(filename)),
	);
};
