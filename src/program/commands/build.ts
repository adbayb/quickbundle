import gzipSize from "gzip-size";
import { Termost, helpers } from "termost";
import { build } from "../../bundler";
import { readFile } from "../../helpers";
import { ProgramContext } from "../types";

type BuildCommandContext = {
	sizes: Array<{ filename: string; raw: number; gzip: number }>;
	outfiles: Array<string>;
};

export const createBuildCommand = (program: Termost<ProgramContext>) => {
	program
		.command<BuildCommandContext>({
			name: "build",
			description: "Build the source code (production mode)",
		})
		.task({
			key: "outfiles",
			label: "Bundle assets 📦",
			async handler(context) {
				const outfiles = await build({
					isFast: context.noCheck,
					isProduction: true,
				});

				return outfiles.filter(
					(outfile): outfile is string => outfile !== null
				);
			},
		})
		.task({
			key: "sizes",
			label: "Compute sizes 🔢",
			async handler(context) {
				return await calculateBundleSize(context.outfiles);
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
