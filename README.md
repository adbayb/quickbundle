<br>
<div align="center">
    <h1>📦 Quickbundle</h1>
    <strong>The zero-configuration bundler powered by ESBuild</strong>
</div>
<br>
<br>

## ✨ Features

Quickbundle allows you to bundle a library in a **quick**, **fast** and **easy** way:

-   Fast build and watch mode thanks to [esbuild](https://esbuild.github.io/)
-   Zero configuration: define the build artifacts in your `package.json` and you're all set!
-   JavaScript, TypeScript, JSX, CSS, JSON, Image and Text support following [esbuild support](https://esbuild.github.io/content-types/)
-   Support of multiple module formats including `cjs` & `esm`
-   Bundling can be done for several platform targets including `browser` or `node`
-   Optimized build with automatic dependency inclusion (`peerDependencies` and `dependencies` are not bundled in the final output whatever the defined platform target)

<br>

## 🚀 Quickstart

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
	"source": "src/index.ts", // Source code entrypoint
	"main": "./dist/index.cjs", // CommonJS output file
	"module": "./dist/index.mjs", // ESM output file
	"types": "./dist/index.d.ts", // Typing output file
	"platform": "node", // Platform target (optional, by default "browser")
	"scripts": {
		"build": "quickbundle build", // Production mode (optimizes bundle)
		"watch": "quickbundle watch", // Development mode (watches each file change)
	}
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

-   [@adbayb/scripts](https://github.com/adbayb/stack) My opinionated toolbox for JavaScript/TypeScript projects

Contribution welcomed! 🤗

<br>

## 💙 Acknowledgements

-   The backend is powered by [ESBuild](https://github.com/evanw/esbuild) to make blazing-fast builds. A special shoutout to its author [Evan Wallace](https://github.com/evanw) and [all contributors](https://github.com/evanw/esbuild/graphs/contributors).
-   The zero-configuration approach was inspired by [microbundle](https://github.com/developit/microbundle). A special shoutout to its author [Jason Miller](https://github.com/developit) and [all contributors](https://github.com/developit/microbundle/graphs/contributors).

<br>

## 📖 License

[MIT](./LICENSE "License MIT")
