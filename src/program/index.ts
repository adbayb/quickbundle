import { Termost, termost } from "termost";
import { createBuildCommand } from "./commands/build";
import { ProgramContext } from "./types";
import { createWatchCommand } from "./commands/watch";

const createProgram = (
	...commandBuilders: Array<(program: Termost<ProgramContext>) => void>
) => {
	const program = termost<ProgramContext>(
		"The zero-configuration bundler powered by ESBuild"
	);

	program.option({
		key: "noCheck",
		name: "no-check",
		description:
			"Enable fast mode by forcing the deactivation of `tsc` types checking and generation",
		defaultValue: false,
	});

	for (const commandBuilder of commandBuilders) {
		commandBuilder(program);
	}
};

createProgram(createBuildCommand, createWatchCommand);
