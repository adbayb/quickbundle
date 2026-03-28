import type { Termost } from "termost";

import { createConfiguration } from "../bundler/config";
import { watch } from "../bundler/watch";
import { createCommand } from "../helpers";

export const createWatchCommand = (program: Termost) => {
	return createCommand(program, {
		description: "Watch and rebuild on any code change (development mode)",
		name: "watch",
	}).task({
		handler(context) {
			watch(
				createConfiguration({
					minification: context.minification,
					sourceMaps: context.sourceMaps,
					standalone: false,
				}),
			);
		},
	});
};
