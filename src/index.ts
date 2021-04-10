#!/usr/bin/env node

import { setup } from "@adbayb/terminal-kit";

setup();

const command = process.argv[2];

// eslint-disable-next-line sonarjs/no-small-switch
switch (command) {
	case "build":
		require("./commands/build");

		break;
	// case "watch":
	// 	require("./commands/watch");
	// 	break;
	default:
		throw new ReferenceError("Command not found");
}
