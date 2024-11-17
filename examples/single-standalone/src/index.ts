#!/usr/bin/env node

import process from "node:process";

import { Spinner } from "picospinner";

console.info("Hello world\n");

console.debug(
	"Debug information",
	JSON.stringify(
		{
			embeddedNodeVersion: process.version,
		},
		null,
		2,
	),
);

const spinner = new Spinner("Fake processing");

spinner.start();

const sleep = async (duration = 3000) => {
	return new Promise((resolve) => setTimeout(resolve, duration));
};

// eslint-disable-next-line unicorn/prefer-top-level-await
void sleep().then(() => {
	spinner.succeed("Finished.");
});
