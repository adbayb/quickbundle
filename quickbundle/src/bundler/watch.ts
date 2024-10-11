import { relative } from "node:path";
import { watch as rollupWatch } from "rollup";
import type { InputOption } from "rollup";
import { helpers } from "termost";

import CONFIGURATIONS from "./config";
import { onLog } from "./helpers";

export const watch = () => {
	process.env.NODE_ENV ??= "development";

	const watcher = rollupWatch(
		CONFIGURATIONS.map((config) => ({
			...config,
			onLog,
		})),
	);

	console.clear();

	watcher.on("event", async (event) => {
		switch (event.code) {
			case "BUNDLE_START": {
				console.clear();

				const { input, output } = event;

				helpers.message(
					`Waiting for ${getStringifiedInputOutput(input, output)} build to be done...`,
					{
						type: "information",
					},
				);

				return;
			}
			case "BUNDLE_END": {
				console.clear();

				const { duration, input, output, result } = event;

				await result.close();

				helpers.message(
					`Build of ${getStringifiedInputOutput(input, output)} done in ${duration}ms (at ${new Date().toLocaleTimeString()})`,
					{ type: "success" },
				);

				return;
			}
			case "ERROR": {
				console.clear();

				const { error } = event;

				helpers.message(`${String(error)}`, { type: "error" });
				console.error("\n", error);

				return;
			}
			default:
				break;
		}
	});
};

const getStringifiedInputOutput = (
	input: InputOption | undefined,
	output: readonly string[],
) => {
	return `${JSON.stringify(input)} ~> ${output.map((filepath) => JSON.stringify(relative(process.cwd(), filepath))).join(", ")}`;
};
