import type { Termost } from "termost";

import { termost } from "termost";

import { name, version } from "../package.json" with { type: "json" };
import { createBuildCommand } from "./commands/build";
import { createCompileCommand } from "./commands/compile";
import { createWatchCommand } from "./commands/watch";

const createProgram = (...commandBuilders: ((program: Termost) => void)[]) => {
	const program = termost({
		description:
			"The zero-configuration transpiler and bundler for the web",
		name,
		version,
	});

	for (const commandBuilder of commandBuilders) {
		commandBuilder(program);
	}
};

createProgram(createBuildCommand, createWatchCommand, createCompileCommand);
