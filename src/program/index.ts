import { Termost, termost } from "termost";
import { createBuildCommand } from "./commands/build";
import { createWatchCommand } from "./commands/watch";

const createProgram = (
	...commandBuilders: Array<(program: Termost) => void>
) => {
	const program = termost(
		"The zero-configuration bundler powered by ESBuild"
	);

	for (const commandBuilder of commandBuilders) {
		commandBuilder(program);
	}
};

createProgram(createBuildCommand, createWatchCommand);
