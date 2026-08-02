import { createConfig } from "../bundler/config";
import { watch } from "../bundler/watch";
import { createBuildLikeCommand } from "../helpers";
import type { CommandFactory } from "../types";

export const createWatchCommand: CommandFactory = (program) => {
	createBuildLikeCommand(program, {
		name: "watch",
		description: "Watch and rebuild on any code change (development mode)",
	}).task({
		handler(context) {
			watch(
				createConfig({
					minification: context.minification,
					sourceMaps: context.sourceMaps,
					standalone: false,
				}),
			);
		},
	});
};
