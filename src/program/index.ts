import { Termost, termost } from "termost";
import { createBuildCommand } from "./commands/build";
import { ProgramContext } from "./types";
import { createWatchCommand } from "./commands/watch";

const createProgram = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	...commandBuilders: Array<(program: Termost<any>) => void>
) => {
	const program = termost<ProgramContext>(
		"The zero-configuration bundler powered by ESBuild"
	);

	program.option({
		key: "noCheck",
		name: "no-check",
		description:
			"Enable fast mode by forcing the deactivation of `tsc` checking and types generation",
		defaultValue: false,
	});

	for (const commandBuilder of commandBuilders) {
		commandBuilder(program);
	}
};

createProgram(createBuildCommand, createWatchCommand);
