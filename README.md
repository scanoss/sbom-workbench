# [SBOM Workbench](https://scanoss.com/product)

<div>

![GitHub release (latest by date)](https://img.shields.io/github/v/release/scanoss/sbom-workbench)
![License](https://img.shields.io/badge/license-GPL--2.0-brightgreen)
[![REUSE status](https://api.reuse.software/badge/github.com/scanoss/sbom-workbench)](https://api.reuse.software/info/github.com/scanoss/sbom-workbench)
![test_workflow](https://github.com/scanoss/sbom-workbench/actions/workflows/test.yml/badge.svg?branch=main)

</div>

The SBOM Workbench is a graphical user interface to scan and audit source code using SCANOSS API.

Auditing your source code for license compliance has never been easier. Simply scan your source code directory to find and identify open source components. Generate your SPDX-Lite software bill of materials (SBOM) with the press of a button.

<div align="center">
  <img src=".erb/img/workbench_1.c77c358.png" align="center" width="70%" />
</div>

## Prerequisites

- Node.js v14+
- NPM (Node Packages Manager)

We strongly recommend handling your node versions using [nvm](https://github.com/nvm-sh/nvm)

## Install

```bash
npm install --legacy-peer-deps
```
Please note that you should include the `--legacy-peer-deps` parameter in the installation command. This is because `@mui/styles` is not compatible with React 18. You can find more information about this at [https://mui.com/system/styles/basics/](https://mui.com/system/styles/basics/).

### Troubleshooting

SBOM Workbench uses [node-gyp](https://www.npmjs.com/package/node-gyp) to compile SQLite3 native module.
This module uses "node-pre-gyp" to download the prebuilt binary for your platform instead you need build from source.
In case it does not exist for your platform, node-gyp going to build it.

Depending on your operating system, you will need prepare the correct environment to run node-gyp: See [https://github.com/nodejs/node-gyp#installation](https://github.com/nodejs/node-gyp#installation)

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

## Multi-language (i18n)

SBOM Workbench is multi-language enabled. To contribute a new language please see our [internationalization documentation](assets/i18n/README.md).

## Workbench Configuration
SBOM Workbench support advanced settings. All the configurations needs to be included in the workspace config file `~/scanoss-workspace/workspaceCfg.json`

### Scanner parameters

`"SCANNER_CONCURRENCY_LIMIT": "<integer>"`
Number of threads to use while scanning (optional - default 5)

`"SCANNER_POST_SIZE": "<intenger>"`
Number of kilobytes to limit the post to while scanning (optional - default 16)

`"SCANNER_TIMEOUT": "<integer>"`
Timeout (in seconds) for API communication (optional - default 300)

### Proxy settings
You might need to specify proxy settings depending on how your network is configured

`"PROXY": "<proxy_ip_address>:<proxy_port>"`

If your network is using a proxy with SSL interception you can include your certificate in the configuration

`  "CA_CERT": "<certificate_path>"`

You can disable any SSL errors, to do so you can change this option to true

`"IGNORE_CERT_ERRORS:"true"`

## [Collaborative Workspace](COLLAB_WORKSPACE.md)

## Contributing

SBOM Workbench is an open source project, and we love to receive contributions from our community. There are many ways to contribute. For more information see the [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## Docs

This project was made using Electron React Boilerplate

See [docs and guides here](https://electron-react-boilerplate.js.org/docs/installation)
