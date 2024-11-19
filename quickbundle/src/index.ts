import { termost } from "termost";
import type { Termost } from "termost";

import { name, version } from "../package.json" with { type: "json" };
import { createWatchCommand } from "./commands/watch";
import { createCompileCommand } from "./commands/compile";
import { createBuildCommand } from "./commands/build";

const createProgram = (...commandBuilders: ((program: Termost) => void)[]) => {
	const program = termost({
		name,
		description:
			"The zero-configuration transpiler and bundler for the web",
		version,
	});

	for (const commandBuilder of commandBuilders) {
		commandBuilder(program);
	}
};

createProgram(createBuildCommand, createWatchCommand, createCompileCommand);
