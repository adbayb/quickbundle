import gzipSize from "gzip-size";
import { createBundler } from "../entities/bundler";
import { createProject } from "../entities/project";
import { readFile } from "../helpers";
import { program } from ".";

program
	.command({
		name: "build",
		description: "Build the source code in production mode",
	})
	.task({
		key: "setup",
		label: "Retrieve information ⚙️",
		async handler() {
			const project = createProject();
			const targets = Object.keys(project.destination) as Array<
				"esm" | "cjs"
			>;

			return { project, targets };
		},
	})
	.task({
		key: "outfiles",
		label: "Transpile and bundle 👷‍♂️ (todo dynamic label?)",
		async handler({ setup }) {
			const bundle = await createBundler(setup.project, {
				isProduction: true,
			});

			return await Promise.all(
				setup.targets.map((target: "esm" | "cjs") => bundle(target))
			);
		},
	})
	.task({
		key: "sizes",
		label: "Compute size 📐",
		async handler(values) {
			return await calculateBundleSize(values.outfiles);
		},
	})
	.message({
		handler({ sizes }, helpers) {
			// @todo: review typing
			const padding =
				sizes
					.map((item: any) => item.raw)
					.reduce((pad: number, currentRawSize: number) => {
						return Math.max(pad, String(currentRawSize).length);
					}, 0) + 2;

			sizes.forEach((item: any) => {
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
