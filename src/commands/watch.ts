import { run } from "@adbayb/terminal-kit";
import { createBundler } from "../entities/bundler";
import { createProject } from "../entities/project";

const main = async () => {
	const project = createProject();
	const bundle = await createBundler(project, {
		isProduction: false,
		isWatchMode: true,
	});

	console.clear();
	await run(`Watching 🔎`, bundle("esm"));
};

main();
