#!/usr/bin/env node

import { join } from "node:path";
import { createRequire } from "node:module";

const package_ = createRequire(import.meta.url)("../package.json");

import(join("..", package_.exports["."].default));
