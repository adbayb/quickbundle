import { watch as rollupWatch } from "rollup";
import { helpers } from "termost";

import type { Configuration } from "./config";
import { onLog } from "./helpers";

export const watch = (configurations: Configuration[]) => {
	process.env.NODE_ENV ??= "development";

	const watcher = rollupWatch(
		configurations.map((config) => ({
			...config,
			onLog,
		})),
	);

	let startDuration: number;

	console.clear();

	watcher.on("event", async (event) => {
		switch (event.code) {
			case "START": {
				startDuration = Date.now();

				clearLog(`Build in progress...`, {
					type: "information",
				});

				return;
			}
			case "BUNDLE_END":
				await event.result.close();

				break;
			case "END": {
				const duration = Date.now() - startDuration;

				clearLog(
					`Build done in ${duration}ms (at ${new Date().toLocaleTimeString()})`,
					{ type: "success" },
				);

				return;
			}
			case "ERROR": {
				const { error } = event;

				clearLog(`${String(error)}`, { type: "error" });
				console.error("\n", error);

				return;
			}
			default:
				break;
		}
	});
};

const clearLog = (...input: Parameters<typeof helpers.message>) => {
	console.clear();

	helpers.message(...input);
};
