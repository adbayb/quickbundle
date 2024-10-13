<br>
<div align="center">
    <h1>📦 Quickbundle</h1>
    <strong>The zero-configuration transpiler and bundler for the web</strong>
</div>
<br>
<br>

## ✨ Features

Quickbundle allows you to bundle a library in a **quick**, **fast** and **easy** way:

-   Fast build and watch mode powered by [Rollup module bundler](https://rollupjs.org/) and [SWC transpiler](https://swc.rs/).
-   Zero configuration: define the build artifacts in your `package.json`, and you're all set!
-   Support of `cjs` & `esm` module formats output.
-   Support of several loaders including JavaScript, TypeScript, JSX, JSON, and Images.
-   TypeScript's declaration file (`.d.ts`) bundling.
-   Automatic dependency inclusion (`peerDependencies` and `dependencies` are not bundled in the final output, `devDependencies` are unless they're not imported).

<br>

## 🚀 Quick Start

1️⃣ Install by running:

```bash
# Npm
npm install quickbundle
# Pnpm
pnpm add quickbundle
# Yarn
yarn add quickbundle
```

2️⃣ Set up your package configuration (`package.json`):

```jsonc
{
	"name": "lib", // Package name
	"exports": {
		".": {
			"source": "src/index.ts(x)?", // Source code entrypoint
			"types": "./dist/index.d.ts", // Typing output file (if defined, can increase build time)
			"import": "./dist/index.mjs", // ESM output file
			"require": "./dist/index.cjs" // CommonJS output file
		}
	}
	"scripts": {
		"build": "quickbundle build", // Production mode (optimizes bundle)
		"watch": "quickbundle watch", // Development mode (watches each file change)
	},
	// ...
}
```

3️⃣ Try it by running:

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

-   Include, in the build output, only the code that is effectively imported and used in the source code. Setting the `sideEffects` package.json field to `false` marks the package as a side-effect-free one and helps Quickbundle to safely prune unused exports.
-   [Identify and annotate](https://rollupjs.org/configuration-options/#treeshake-annotations) side-effect-free code (functions, ...) to enable a fine-grained dead-code elimination process later consumer side. For example, if a consumer uses only one library API, build output annotations added by Quickbundle allow the consumer's bundler remove all other unused APIs.

However, Quickbundle doesn't minify the build output. Indeed, in general, **if the build targets a library (the most Quickbundle use case)**, minification is not necessary since enabling it can introduce some challenges:

-   Reduce the build output discoverability inside the `node_modules` folder (minified code is an obfuscated code that can be hard to read for code audit/debugging purposes).
-   Generate suboptimal source maps for the bundled library, as the consumer bundler will generate source maps based on the already minified library build (transformed code, mangled variable names, etc.).
-   Risk of side effects with double optimizations (producer side and then consumer side).

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

<br>

## 🤩 Used by

-   [@adbayb/stack](https://github.com/adbayb/stack) My opinionated toolbox for JavaScript/TypeScript projects.

<br>

## ✍️ Contribution

We're open to new contributions, you can find more details [here](./CONTRIBUTING.md).

<br>

## 💙 Acknowledgements

-   The backend is powered by [Rollup](https://github.com/rollup/rollup) and its plugin ecosystem (including [SWC](https://github.com/swc-project/swc)) to make blazing-fast builds. A special shoutout to all contributors involved.
-   The zero-configuration approach was inspired by [microbundle](https://github.com/developit/microbundle). A special shoutout to its author [Jason Miller](https://github.com/developit) and [all contributors](https://github.com/developit/microbundle/graphs/contributors).

<br>

## 📖 License

[MIT](./LICENSE "License MIT").
