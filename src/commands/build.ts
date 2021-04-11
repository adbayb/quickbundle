import { run } from "@adbayb/terminal-kit";
import gzipSize from "gzip-size";
import { BundlerFormat, createBundler } from "../entities/bundler";
import { createProject } from "../entities/project";
import { coloredText, readFile } from "../helpers";

const main = async () => {
	const project = createProject();
	const bundle = await createBundler(project, {
		isProduction: true,
		isWatchMode: false,
	});
	const formats: BundlerFormat[] = ["cjs", "esm"];
	let output = "";

	for (const format of formats) {
		const outfile = await run(`Building ${format} 👷‍♂️`, bundle(format));
		const content = await readFile(outfile);
		const gzSize = await gzipSize(content);

		output += `📦 ${outfile}\n${coloredText(
			content.byteLength.toString().padStart(11) + " B",
			"green"
		)} raw\n${coloredText(
			gzSize.toString().padStart(11) + " B",
			"green"
		)}  gz\n`;
	}

	console.info(`\n${output}`);
};

main();
