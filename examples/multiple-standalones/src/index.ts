#!/usr/bin/env node

import process from "node:process";

import ora from "ora";

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

const spinner = ora("Fake processing").start();

const sleep = async (duration = 3000) => {
	return new Promise((resolve) => setTimeout(resolve, duration));
};

void sleep().then(() => {
	spinner.stop();
});
