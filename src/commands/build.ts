import { run } from "@adbayb/terminal-kit";
import gzipSize from "gzip-size";
import { createBundler } from "../entities/bundler";
import { createProject } from "../entities/project";
import { readFile, text } from "../helpers";

const calculateBundleSize = async (filenames: string[]) => {
	let output = "";

	const calculateFileSize = async (filename: string) => {
		const content = await readFile(filename);
		const gzSize = await gzipSize(content);

		return {
			raw: content.byteLength,
			gzip: gzSize,
		};
	};

	for (const filename of filenames) {
		const size = await calculateFileSize(filename);

		output += `📦 ${filename}\n${text(
			size.raw.toString().padStart(11) + " B",
			{ color: "green" }
		)} raw\n${text(size.gzip.toString().padStart(11) + " B", {
			color: "green",
		})}  gz\n`;
	}

	return output;
};

const main = async () => {
	const project = createProject();
	const bundle = await createBundler(project, {
		isProduction: true,
	});
	const targets = Object.keys(project.destination) as Array<"esm" | "cjs">;
	const outfiles = await run(
		`Building ${targets.join(", ")} 👷‍♂️`,
		Promise.all(targets.map((target) => bundle(target)))
	);

	const sizeOutput = await run<string>(
		`Calculating bundle size 📐`,
		calculateBundleSize(outfiles)
	);

	console.info(`\n${sizeOutput}`);
};

main();
