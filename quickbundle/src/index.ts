import { termost } from "termost";
import { name, version } from "../package.json" with { type: "json" };
import { createBuildCommand } from "./commands/build";
import { createCompileCommand } from "./commands/compile";
import { createWatchCommand } from "./commands/watch";
import type { CommandFactory } from "./types";

const createProgram = (...commandFactories: CommandFactory[]) => {
	const program = termost({
		name,
		description: "The zero-configuration transpiler and bundler for the web",
		version,
	});

	for (const createCommand of commandFactories) {
		createCommand(program);
	}
};

createProgram(createBuildCommand, createWatchCommand, createCompileCommand);
