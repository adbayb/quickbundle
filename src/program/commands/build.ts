import gzipSize from "gzip-size";
import { Termost } from "termost";
import { createBundler } from "../../bundler";
import { Project, createProject } from "../../bundler/metadata";
import { readFile } from "../../helpers";

interface BuildContext {
	setup: {
		project: Project;
		targets: Array<"esm" | "cjs">;
	};
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
			key: "setup",
			label: "Retrieve information ⚙️",
			async handler() {
				const project = createProject();
				const targets = Object.keys(
					project.destination
				) as BuildContext["setup"]["targets"];

				return { project, targets };
			},
		})
		.task({
			key: "outfiles",
			label: ({ values }) =>
				`Transpile to ${values.setup.targets.join(", ")} bundles 👷‍♂️`,
			async handler({ values }) {
				const bundle = await createBundler(values.setup.project, {
					isProduction: true,
				});

				return await Promise.all(
					values.setup.targets.map((target) => bundle(target))
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
