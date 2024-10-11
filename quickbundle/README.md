<br>
<div align="center">
    <h1>📦 Quickbundle</h1>
    <strong>The zero-configuration bundler</strong>
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
			"require": "./dist/index.cjs", // CommonJS output file
			// "default": "./dist/index.js", // Or replace `import` and `require` by the `default` fallback (must always come last), the bundler will automatically assess the module format based on `type` field and file extension name.
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

## 🤩 Used by

-   [@adbayb/stack](https://github.com/adbayb/stack) My opinionated toolbox for JavaScript/TypeScript projects.

<br>

## ✍️ Contribution

We're open to new contributions, you can find more details [here](./CONTRIBUTING.md).

<br>

## 💙 Acknowledgements

-   The backend is powered by [Rollup](https://github.com/rollup/rollup) and its plugin ecosystem including [SWC](https://github.com/swc-project/swc) to make blazing-fast builds. A special shoutout to all contributors involved ([Rollup](https://github.com/rollup/rollup/graphs/contributors) and [SWC](https://github.com/swc-project/swc/graphs/contributors)).
-   The zero-configuration approach was inspired by [microbundle](https://github.com/developit/microbundle). A special shoutout to its author [Jason Miller](https://github.com/developit) and [all contributors](https://github.com/developit/microbundle/graphs/contributors).

<br>

## 📖 License

[MIT](./LICENSE "License MIT").
