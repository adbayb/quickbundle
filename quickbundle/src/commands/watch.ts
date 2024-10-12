import type { Termost } from "termost";

import { createConfigurations } from "../bundler/config";
import { watch } from "../bundler/watch";

type WatchCommandContext = {
	minification: boolean;
	sourceMaps: boolean;
};

export const createWatchCommand = (program: Termost) => {
	program
		.command<WatchCommandContext>({
			name: "watch",
			description:
				"Watch and rebuild on any code change (development mode)",
		})
		.option({
			key: "minification",
			name: "minification",
			description: "Enable minification",
			defaultValue: false,
		})
		.option({
			key: "sourceMaps",
			name: "source-maps",
			description: "Enable source maps generation",
			defaultValue: false,
		})
		.task({
			handler(context) {
				watch(
					createConfigurations({
						minification: context.minification,
						sourceMaps: context.sourceMaps,
					}),
				);
			},
		});
};
