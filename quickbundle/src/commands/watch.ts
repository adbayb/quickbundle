import type { Termost } from "termost";

import { createConfigurations } from "../bundler/config";
import { watch } from "../bundler/watch";

import { createCommand } from "./createCommand";
import type { CreateCommandContext } from "./createCommand";

type WatchCommandContext = CreateCommandContext;

export const createWatchCommand = (program: Termost) => {
	createCommand<WatchCommandContext>(program, {
		name: "watch",
		description: "Watch and rebuild on any code change (development mode)",
	}).task({
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
