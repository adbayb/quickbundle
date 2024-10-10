import { watch as rollupWatch } from "rollup";

import CONFIGURATIONS from "./createConfigurations";

export const watch = () => {
	process.env.NODE_ENV ??= "development";

	const watcher = rollupWatch(CONFIGURATIONS);

	watcher.on("event", (event) => {
		switch (event.code) {
			case "BUNDLE_START": {
				const { input, output } = event;

				console.log(JSON.stringify(input), JSON.stringify(output));
				console.log("[rollup] Start");

				return;
			}
			case "BUNDLE_END": {
				const { duration, input, output } = event;

				console.log(JSON.stringify(input), JSON.stringify(output));

				console.log("[rollup] End", `in ${duration}ms`);

				// await watcher.close();

				return;
			}
			case "ERROR": {
				console.error("Error trigger", event.error);

				return;
			}
			default:
				break;
		}
	});
};
