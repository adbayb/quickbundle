import { watch as rolldownWatch } from "rolldown";
import { createLogger } from "termost";
import type { Config } from "./config";

export const watch = (input: Config) => {
	process.env.NODE_ENV ??= "development";

	const watcher = rolldownWatch(input.data);
	let startDuration: number;

	console.clear();

	watcher.on("event", async (event) => {
		switch (event.code) {
			case "BUNDLE_END": {
				await event.result.close();

				break;
			}
			case "END": {
				const duration = Date.now() - startDuration;

				console.clear();

				logger.success(
					`Build done in ${duration}ms (at ${new Date().toLocaleTimeString()})`,
				);

				return;
			}
			case "ERROR": {
				const { error } = event;

				console.clear();
				logger.error(error.stack ?? error.message);

				return;
			}
			case "START": {
				startDuration = Date.now();
				console.clear();
				logger.info("Build in progress…");

				return;
			}
			case "BUNDLE_START":
			default: {
				break;
			}
		}
	});
};

const logger = createLogger({ name: "watch" });
