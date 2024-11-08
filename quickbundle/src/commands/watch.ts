import type { Termost } from "termost";

import { createCommand } from "../helpers";
import { watch } from "../bundler/watch";
import { createConfiguration } from "../bundler/config";

export const createWatchCommand = (program: Termost) => {
	return createCommand(program, {
		name: "watch",
		description: "Watch and rebuild on any code change (development mode)",
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
