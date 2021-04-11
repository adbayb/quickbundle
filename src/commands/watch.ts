import { run } from "@adbayb/terminal-kit";
import { createBundler } from "../entities/bundler";
import { createProject } from "../entities/project";
import { coloredText } from "../helpers";

const watchableRun = <ReturnValue>(
	promise: Promise<ReturnValue>
): Promise<ReturnValue> => {
	console.clear();

	return run(
		`Watching 🔎 ${coloredText(
			`last at ${new Date().toLocaleTimeString()}`,
			"grey"
		)}`,
		promise
	);
};

const main = async () => {
	const project = createProject();
	const bundle = await createBundler(project, {
		isProduction: false,
		isWatchMode: true,
		onWatch(error) {
			if (error) {
				watchableRun(Promise.reject(error));
			} else {
				watchableRun(Promise.resolve());
			}
		},
	});

	watchableRun(bundle("esm"));
};

main();
