import { termost } from "termost";
import type { Termost } from "termost";

import { createWatchCommand } from "./commands/watch";
import { createBuildCommand } from "./commands/build";

const createProgram = (...commandBuilders: ((program: Termost) => void)[]) => {
	const program = termost(
		"The zero-configuration transpiler and bundler for the web",
	);

	for (const commandBuilder of commandBuilders) {
		commandBuilder(program);
	}
};

createProgram(createBuildCommand, createWatchCommand);
