<div align="center">

![GitHub release (latest by date)](https://img.shields.io/github/v/release/scanoss/audit-workbench)
![License](https://img.shields.io/badge/license-GPL--2.0-brightgreen)
[![REUSE status](https://api.reuse.software/badge/github.com/scanoss/audit-workbench)](https://api.reuse.software/info/github.com/scanoss/audit-workbench)
![test_workflow](https://github.com/scanoss/audit-workbench/actions/workflows/test.yml/badge.svg?branch=main)

</div>

# SCANOSS AUDIT WORKBENCH
The SCANOSS Audit Workbench is a graphical user interface to scan and audit source code using SCANOSS API.


## Prerequisites
- Node.js v14+
- NPM (Node Packages Manager)

We strongly recommend handling your node and npm versions using [nvm](https://github.com/nvm-sh/nvm)

## Install 

```bash
npm install
```

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

For live reloading you can use `npm run start --watch` to run the app using [Electronmon](https://github.com/catdad/electronmon#readme). Warning: this tool has a high memory consumption.

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

## Docs
This project was made using Electron React Boilerplate

See [docs and guides here](https://electron-react-boilerplate.js.org/docs/installation)


