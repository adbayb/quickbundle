import { run } from "@adbayb/terminal-kit";
import { createBundler } from "../entities/bundler";
import { createProject } from "../entities/project";
import { text } from "../helpers";

const watchableRun = <ReturnValue>(
	promise: Promise<ReturnValue>
): Promise<ReturnValue> => {
	console.clear();

	return run(
		`Watching 🔎 ${text(`last at ${new Date().toLocaleTimeString()}`, {
			color: "grey",
		})}`,
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

	// @todo: By default, pick module target for watch mode and if not available main field (ie. cjs build)
	watchableRun(bundle("esm"));
};

main();
