#!/usr/bin/env node

import ora from "ora";

console.info("A standalone program");

const spinner = ora("Fake processing").start();

const sleep = async (duration = 3000) => {
	return new Promise((resolve) => setTimeout(resolve, duration));
};

void sleep().then(() => {
	spinner.stop();
	console.info("End processing");
});
