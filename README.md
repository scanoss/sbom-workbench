<div align="center">

![GitHub release (latest by date)](https://img.shields.io/github/v/release/scanoss/audit-workbench)
![License](https://img.shields.io/badge/license-GPL--2.0-brightgreen)
[![REUSE status](https://api.reuse.software/badge/github.com/SAP/xsk)](https://api.reuse.software/info/github.com/SAP/xsk)

</div>

# SCANOSS AUDIT WORKBENCH
The SCANOSS Audit Workbench is a graphical user interface to scan and audit source code using SCANOSS API.


## Prerequisites
- Node.js v14.x (Unfortunately sqlite3 not supports node.js v16+ so far. We strongly recommend handling your node versions using [nvm](https://github.com/nvm-sh/nvm))
- Yarn (see [installation](https://classic.yarnpkg.com/en/docs/install/#debian-stable))

## Install 

```bash
yarn install
```

## Starting Development

Start the app in the `dev` environment:

```bash
yarn start
```

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```

## Docs
This project was made using Electron React Boilerplate

See [docs and guides here](https://electron-react-boilerplate.js.org/docs/installation)


