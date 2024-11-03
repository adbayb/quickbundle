import type { Termost } from "termost";

import { createConfigurations } from "../bundler/config";
import { watch } from "../bundler/watch";
import { createCommand } from "../helpers";

export const createWatchCommand = (program: Termost) => {
	return createCommand(program, {
		name: "watch",
		description: "Watch and rebuild on any code change (development mode)",
	}).task({
		handler(context) {
			watch(
				createConfigurations({
					minification: context.minification,
					sourceMaps: context.sourceMaps,
					standalone: false,
				}),
			);
		},
	});
};
