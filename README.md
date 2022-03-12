<br>
<div align="center">
    <h1>📦 Quickbundle</h1>
    <strong>The zero-configuration bundler powered by ESBuild</strong>
</div>
<br>
<br>

## ✨ Features

Quickbundle allows you to bundle a library with ease:

-   Fast build thanks to [ESBuild bundler](https://github.com/evanw/esbuild)
-   `package.json` as a first-class citizen to define your project build configurations
-   `CJS` & `ESM` output format support
-   Browser & Node.JS platform target support
-   Peer dependencies support (excluded automatically from the build output)
-   Quick development build support with a watch mode
-   Production build support with optimized output
-   TypeScript support
-   JSX support

<br>

## 🚀 Quickstart

1️⃣ Install by running:

```bash
# NPM
npm install quickbundle
# Yarn
yarn add quickbundle
```

2️⃣ Set up your package configuration (`package.json`):

```jsonc
{
  "name": "lib", // Package name
  "source": "src/index.ts", // Source code entrypoint
  "main": "./dist/lib.cjs", // CommonJS output file
  "module": "./dist/lib.cjs.js", // ESM output file
  "types": "./dist/lib.d.ts", // Typing output file
  "platform": "node", // Platform target (optional, by default "browser")
  "scripts": {
    "prod": "quickbundle build", // Production mode (optimizes bundle)
    "dev": "quickbundle watch", // Development mode (watches each file change)
    "prod:fast": "quickbundle build --no-check", // Production mode with fast transpilation time. This mode disables TypeScript type checking (ie. not using `tsc`) and, consequently, the `types` asset is no more managed by the tool
    "dev:fast": "quickbundle watch --no-check" // Development mode with fast transpilation time
  }
}
```

3️⃣ Try it by running:

```bash
# NPM
npm run prod
# Yarn
yarn prod
```

<br>

## 🤩 Used by

Contribution welcomed! 🤗
