# BachelorProject
Magnus and Sebastian's bachelor project repository

## Running the project

Note: all the following are implemented as vscode tasks

Start by running 

```bash
npm i
```

then 

```bash
npm run dev
```

To run the project in production mode, first run

```bash
npm run build
```

then 

```bash
docker-compose up
```

## Building wasm

The wasm package can be build by going to the src-wasm folder and running

```bash
wasm-pack build --target web
```

You need to have the cargo (rust) package "wasm-pack" installed. It is recommended to use version 0.9.1, as it hasn't been possible to get it to work with any newer versions.

In order for the "build wasm" vscode task to work, you might have to add the following to your vscode settings.json file (replacing linux and zsh with your os and shell)

```json
"terminal.integrated.profiles.linux": {
  "zsh": {
    "path": "/bin/zsh",
    "args": ["-l", "-i"]
  }
}
```

## Before coding

You should have the three plugins "prettier", "eslint" and "sonarlint" installed. Prettier should format on save. This can be tested by e.g. removing a semicolon from the end of a line in a .tsx file and saving - prettier should add the semicolon again. If it doesn't, try adding the following to your global vscode settings

```json
"[typescript]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
},
"[typescriptreact]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
},
```

## Running unit-tests

The unit tests are run using vitest. They can be run with the following command:

```bash
npm test
```