import { run } from "@adbayb/terminal-kit";
import gzipSize from "gzip-size";
import { BundlerFormat, createBundler } from "../entities/bundler";
import { createProject } from "../entities/project";
import { coloredText, readFile } from "../helpers";

const calculateBundleSize = async (filename: string) => {
	const content = await readFile(filename);
	const gzSize = await gzipSize(content);

	return {
		raw: content.byteLength,
		gzip: gzSize,
	};
};

const formatAllBundleSizes = async (filenames: string[]) => {
	let output = "";

	for (const filename of filenames) {
		const size = await calculateBundleSize(filename);

		output += `📦 ${filename}\n${coloredText(
			size.raw.toString().padStart(11) + " B",
			"green"
		)} raw\n${coloredText(
			size.gzip.toString().padStart(11) + " B",
			"green"
		)}  gz\n`;
	}

	return output;
};

const main = async () => {
	const project = createProject();
	const bundle = await createBundler(project, {
		isProduction: true,
		isWatchMode: false,
	});
	const formats: BundlerFormat[] = ["cjs", "esm"];
	const outfiles: string[] = [];

	for (const format of formats) {
		outfiles.push(await run(`Building ${format} 👷‍♂️`, bundle(format)));
	}

	const sizeOutput = await run<string>(
		`Calculating bundle size 📐`,
		formatAllBundleSizes(outfiles)
	);

	console.info(`\n${sizeOutput}`);
};

main();
