import { Termost, termost } from "termost";
import { createBuildCommand } from "./commands/build";
import { createWatchCommand } from "./commands/watch";

const createProgram = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	...commandBuilders: Array<(program: Termost<any>) => void>
) => {
	const program = termost(
		"The zero-configuration bundler powered by ESBuild"
	);

	for (const commandBuilder of commandBuilders) {
		commandBuilder(program);
	}
};

createProgram(createBuildCommand, createWatchCommand);
