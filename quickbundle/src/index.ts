#!/usr/bin/env node

import { termost } from "termost";
import type { Termost } from "termost";

import { createBuildCommand } from "./commands/build";
import { createWatchCommand } from "./commands/watch";

const createProgram = (...commandBuilders: ((program: Termost) => void)[]) => {
	const program = termost(
		"The zero-configuration transpiler and bundler for the web",
	);

	for (const commandBuilder of commandBuilders) {
		commandBuilder(program);
	}
};

createProgram(createBuildCommand, createWatchCommand);
