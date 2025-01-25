<br>
<div align="center">
    <h1>📦 Quickbundle</h1>
    <strong>The zero-configuration transpiler and bundler for the web</strong>
</div>
<br>
<br>

## ✨ Features

Quickbundle allows you to bundle a library in a **quick**, **fast** and **easy** way:

- Zero configuration: define the build artifacts in your `package.json`, and you're all set!
- Fast build and watch mode powered by Rollup[^1] and SWC[^2].
- Compile and cross compile standalone executables for systems that do not have Node.js installed[^3].
- Support of `cjs` & `esm` module formats output.
- Support of several loaders including JavaScript, TypeScript, JSX, JSON, and Images.
- TypeScript's declaration file (`.d.ts`) bundling.
- Automatic dependency inclusion:
    - For the build and watch mode, `peerDependencies` and `dependencies` are not bundled in the final output, `devDependencies` are unless they're not imported.
    - For the compile mode, all dependencies are included to make the code standalone.

[^1]: A [module bundler](https://rollupjs.org/) optimized for better tree-shaking processing and seamless interoperability of CommonJS and ESM formats with minimal code footprint.

[^2]: A [TypeScript / JavaScript transpiler](https://swc.rs/) for quicker code processing including TypeScript transpilation, JavaScript transformation, and, minification.

[^3]: It relies on the [Node.js single executable applications feature](https://nodejs.org/api/single-executable-applications.html).

<br>

## 🚀 Quick Start

### 1️⃣ Install

```bash
# Npm
npm install quickbundle
# Pnpm
pnpm add quickbundle
# Yarn
yarn add quickbundle
```

### 2️⃣ Update your package configuration (`package.json`)

#### For building libraries

- When exporting exclusively ESM format:

```jsonc
{
	"name": "lib", // Package name
	"type": "module", // Optional if you want Node-like runtime to process by default `.js` file as ESM modules.
	"sideEffects": false, // Mark the package as a side-effect-free one to support the consumer dead-code elimination (tree-shaking) process. If your library contains global side effects (ideally, it should be avoided), configure the field to list the files that do have side effects.
	"exports": {
		".": {
			"source": "src/index.ts(x)?", // Source code entry point.
			"types": "./dist/index.d.ts", // Typing output file (if defined, can increase build time). This condition should always come first after the custom `source` field definition.
			"default": "./dist/index.mjs", // By default, Quickbundle will always output ESM format for the `default` field (this condition should always come last since it always matches as a generic fallback). However, take care: if both `import` and `default` fields are defined, provide the same file path, as the `import` field export instruction will be the only one considered to define the output file path.
		},
		"./otherModulePath": {
			// ...
		},
	},
	"scripts": {
		"build": "quickbundle build", // Production mode (optimizes bundle)
		"watch": "quickbundle watch", // Development mode (watches each file change)
	},
	// ...
}
```

- When exporting both CommonJS (CJS) and ECMAScript Modules (ESM) format:

> [!warning]
> Please be aware of [dual-package-hazard-related risks](https://github.com/nodejs/package-examples?tab=readme-ov-file#dual-package-hazard) first.

```jsonc
{
	"name": "lib", // Package name
	"type": "module", // Optional if you want Node-like runtime to process by default `.js` file as ESM modules.
	"sideEffects": false, // Mark the package as a side-effect-free one to support the consumer dead-code elimination (tree-shaking) process. If your library contains global side effects (ideally, it should be avoided), configure the field to list the files that do have side effects.
	"exports": {
		".": {
			"source": "src/index.ts(x)?", // Source code entry point.
			"types": "./dist/index.d.ts", // // Typing output file (if defined, can increase build time). This condition should always come first after the custom `source` field definition.
			"require": "./dist/index.cjs", // CommonJS output file (matches when the module is loaded via require() consumer side).
			"import": "./dist/index.mjs", // ESM output file (matches when the package is loaded via import or import() consumer side).
			"default": "./dist/index.mjs", // By default, Quickbundle will always output ESM format for the `default` field (this condition should always come last since it always matches as a generic fallback). However, take care: if both `import` and `default` fields are defined, provide the same file path, as the `import` field export instruction will be the only one considered to define the output file path.
		},
		"./otherModulePath": {
			// ...
		},
	},
	"scripts": {
		"build": "quickbundle build", // Production mode (optimizes bundle)
		"watch": "quickbundle watch", // Development mode (watches each file change)
	},
	// ...
}
```

#### For compiling executables

> [!warning]
> The `compile` command relies on the [Node.js SEA (Single Executable Applications feature)](https://nodejs.org/api/single-executable-applications.html). This feature comes with some limitations which Quickbundle attempts to address:
>
> - The source code must not rely on [external dependencies](https://github.com/nodejs/single-executable/discussions/70) 🛑. To partially address this, Quickbundle bundles all dependencies (whatever their types, as long as they're used) and inline dynamic imports by default ✅.
> - The bundled code must use the CommonJS module system 🛑. To address this, Quickbundle always outputs CJS modules in compile mode ✅.

```jsonc
{
	"name": "lib", // Package name
	"source": "./src/index.ts", // Source code entry point. Make sure that it starts with `#!/usr/bin/env node` pragme to make the binary portable for consumers who would like to use it by installing the package instead of using the generated standalone executable.
	"bin": {
		"your-binary-name": "./dist/index.cjs", // Binary information to get the executable name from the key and, from the value, the bundled file to generate from the source code and inject into the executable. The generated executable will be located in the same folder as the bundled file and, by default, dependending on the current operating system running the `compile` command, the executable will be named either `your-binary-name.exe` on Windows or `your-binary-name` on Linux and macOS. For cross-compilation output, check the `Patterns` section.
	},
	// "bin": "./dist/index.cjs", // Or, if the binary name follows the package name, you can define a string-based `bin` value.
	"scripts": {
		"build": "quickbundle compile",
	},
	// ...
}
```

### 3️⃣ Try it

```bash
# Npm
npm run build
# Pnpm
pnpm build
# Yarn
yarn build
```

<br>

## 👨‍🍳 Patterns

### Optimize the build output

By default, Quickbundle does the following built-in optimizations during the bundling process:

- Include, in the build output, only the code that is effectively imported and used in the source code. Setting the `sideEffects` package.json field to `false` marks the package as a side-effect-free one and helps Quickbundle to safely prune unused exports.
- [Identify and annotate](https://rollupjs.org/configuration-options/#treeshake-annotations) side-effect-free code (functions, ...) to enable a fine-grained dead-code elimination process later consumer side. For example, if a consumer uses only one library API, build output annotations added by Quickbundle allow the consumer's bundler remove all other unused APIs.

However, Quickbundle doesn't minify the build output. Indeed, in general, **if the build targets a library (the most Quickbundle use case)**, minification is not necessary since enabling it can introduce some challenges:

- Reduce the build output discoverability inside the `node_modules` folder (minified code is an obfuscated code that can be hard to read for code audit/debugging purposes).
- Generate suboptimal source maps for the bundled library, as the consumer bundler will generate source maps based on the already minified library build (transformed code, mangled variable names, etc.).
- Risk of side effects with double optimizations (producer side and then consumer side).

Popular open source libraries ([Vue](https://unpkg.com/browse/vue@3.4.24/dist/), [SolidJS](https://unpkg.com/browse/solid-js@1.8.17/dist/), [Material UI](https://unpkg.com/browse/@material-ui/core@4.12.4/), ...) do not provide minified builds as the build optimization is sensitive to the consumer context (e.g. environment targets (browser support), ...) and needs to be fully owned upstream (i.e. consumer/application-side).

However, for non-library targets or if you would like to minify the build output on your side anyway, Quickbundle still provides the ability to enable the minification via:

```bash
quickbundle build --minification
quickbundle watch --minification
```

### Enable source maps generation

By default, source maps are not enabled but Quickbundle still provides the ability to enable it via:

```bash
quickbundle build --source-maps
quickbundle watch --source-maps
```

Enabling source map generation is needed only if a build is [obfuscated (minified)](#optimize-the-build-output) for debugging-easing purposes. It generally pairs with the [`minification` flag](#optimize-the-build-output).

### Cross compilation to other platforms

By default, the `compile` command embeds the runtime at the origin of its execution which means it generates executables compatible only with machines running the same operating system, processor architecture, and Node.js version.

However, Quickbundle provides the ability to target a different operating system, processor architecture, or Node.js version (also known as cross-compilation):

```bash
quickbundle compile --target node-v23.1.0-darwin-arm64 # Embeds Node v23 runtime built for macOS ARM64 target
quickbundle compile --target node-v23.1.0-darwin-x64 # Embeds Node v23 runtime built for macOS X64 target
quickbundle compile --target node-v23.1.0-linux-arm64 # Embeds Node v23 runtime built for Linux ARM64 target
quickbundle compile --target node-v23.1.0-linux-x64 # Embeds Node v23 runtime built for Linux X64 target
quickbundle compile --target node-v23.1.0-win-arm64 # Embeds Node v23 runtime built for Windows ARM64 target
quickbundle compile --target node-v23.1.0-win-x64 # Embeds Node v23 runtime built for Windows X64 target
```

> [!note]
> The target input must follow the `node-vx.y.z-(darwin|linux|win)-(arm64|x64|x86)` format (for an exhaustive view, check available filenames in [https://nodejs.org/download/release/vx.y.z](https://nodejs.org/download/release/latest/)).

<br>

## 🤩 Used by

- [@adbayb/stack](https://github.com/adbayb/stack) My opinionated toolbox for JavaScript/TypeScript projects.

<br>

## ✍️ Contribution

We're open to new contributions, you can find more details [here](./CONTRIBUTING.md).

<br>

## 💙 Acknowledgements

- The backend is powered by [Rollup](https://github.com/rollup/rollup) and its plugin ecosystem (including [SWC](https://github.com/swc-project/swc)) to make blazing-fast builds. A special shoutout to all contributors involved.
- The zero-configuration approach was inspired by [microbundle](https://github.com/developit/microbundle). A special shoutout to its author [Jason Miller](https://github.com/developit) and [all contributors](https://github.com/developit/microbundle/graphs/contributors).

<br>

## 📖 License

[MIT](./LICENSE "License MIT").

<br>
