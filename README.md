# [SBOM Workbench](https://scanoss.com/product)

<div>

![GitHub release (latest by date)](https://img.shields.io/github/v/release/scanoss/sbom-workbench)
![License](https://img.shields.io/badge/license-GPL--2.0--only-brightgreen)
[![REUSE status](https://api.reuse.software/badge/github.com/scanoss/sbom-workbench)](https://api.reuse.software/info/github.com/scanoss/sbom-workbench)
![test_workflow](https://github.com/scanoss/sbom-workbench/actions/workflows/test.yml/badge.svg?branch=main)

</div>

The SBOM Workbench is a graphical user interface to scan and audit source code using SCANOSS API.

Auditing your source code for license compliance has never been easier. Simply scan your source code directory to find and identify open source components. Generate your SPDX-Lite software bill of materials (SBOM) with the press of a button.

_Find prebuilt binaries for all platforms over at: [Software Transparency Foundation](https://www.softwaretransparency.org/download)_


<div align="center">
  <img src=".erb/img/workbench_1.c77c358.png" align="center" width="70%" />
</div>

## Prerequisites

- Node.js >=v22.12.0
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
SBOM Workbench support advanced settings. All the configurations needs to be included in the global config file `~/.scanoss/sbom-workbench-settings.json`

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

`"CA_CERT": "<certificate_path>"`

You can disable any SSL errors, to do so you can change this option to true

`"IGNORE_CERT_ERRORS": true`

# Local Cryptography Detection in SBOM-Workbench

## Overview

Local cryptography can be detected by SBOM-Workbench when an API key is configured. This feature enables the detection of cryptographic algorithms and libraries within a codebase.

## Default and Custom Detection Rules

Default rules are provided for the detection of cryptographic algorithms and libraries. However, custom rules may be defined at the root of the project to be scanned.

### Custom Rule Files

Custom rules can be defined through the following JSON files at the project root:

- **Algorithm detection rules**: `scanoss-crypto-algorithm-rules.json`. See: [Algorithm Rules Sample](./assets/data/scanoss-crypto-algorithm-rules.json)
- **Library detection rules**: `scanoss-crypto-library-rules.json`

## Rule File Structure

### Algorithm Rules Structure

The structure of `scanoss-crypto-algorithm-rules.json` should be formatted as follows:
```json
[
   {
     "algorithmId": "md5",
     "algorithm": "MD5 Message-Digest Algorithm",
     "strength": "128",
     "keywords": [
       "md5_file",
       "md5",
       "md5crypt",
       "aprcrypt",
       "md5_encrypt",
       "md5_block_data_order",
       "ossl_md5_sha1_",
       "MD5_Init"
     ]
   }
 ]
``` 

### Library Rules Structure

The structure of `scanoss-crypto-library-rules.json` should be formatted as follows:
```json
[
  {
    "id": "library/webcrypto",
    "name": "Web Cryptography API",
    "description": "A JavaScript API for performing basic cryptographic operations in web applications.",
    "keywords": [
      "window.crypto.subtle",
      "crypto.subtle.",
      "crypto.getRandomValues",
      "NodeWebCrypto",
      "WebCryptoAPI"
    ],
    "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API",
    "category": "library",
    "purl": "pkg:generic/webcrypto",
    "tags": [
      "JavaScript"
    ]
  }
 ]
``` 


# SCANOSS Settings File
SCANOSS provides a settings file to customize the scanning process. The settings file is a JSON file that contains project information and BOM (Bill of Materials) rules. It allows you to include, remove, or replace components in the BOM before and after scanning.

### Settings
The ``scanoss.json`` object allows you to configure various aspects of the scanning process. Currently, it provides control over which files should be skipped during scanning through the ``skip`` property.


### BOM Rules

The ``bom`` section defines rules for modifying the BOM before and after scanning. It contains three main operations:

### 1. Include Rules

Rules for adding context when scanning. These rules will be sent to the SCANOSS API meaning they have more chance of being considered part of the resulting scan.



    {
        "bom": {
            "include": [
                {
                    "path": "/path/to/file",
                    "purl": "pkg:npm/vue@2.6.12",
                    "comment": "Optional comment"
                }
            ]
        }
    }

### 2. Remove Rules

Rules for removing files from results after scanning. These rules will be applied to the results file after scanning. The post processing happens on the client side.


    {
        "bom": {
            "remove": [
                {
                    "path": "/path/to/file",
                    "purl": "pkg:npm/vue@2.6.12",
                    "comment": "Optional comment"
                }
            ]
        }
    }

### 3. Replace Rules

Rules for replacing components after scanning. These rules will be applied to the results file after scanning. The post processing happens on the client side.

    {
        "bom": {
            "replace": [
                {
                    "path": "/path/to/file",
                    "purl": "pkg:npm/vue@2.6.12",
                    "replace_with": "pkg:npm/vue@2.6.14",
                    "license": "MIT",
                    "comment": "Optional comment"
                }
            ]
        }
    }


# Matching Rules


1. **Full Match**: Requires both PATH and PURL to match. It means the rule will be applied ONLY to the specific file with the matching PURL and PATH.
2. **Partial Match**: Matches based on either:
   - PURL only (PATH is optional). It means the rule will be applied to all files with the matching PURL.
 
Example Configuration
---------------------

Here's a complete example showing all sections:


    {
        "bom": {
            "include": [
                {
                    "path": "src/lib/component.js",
                    "purl": "pkg:npm/lodash@4.17.21",
                    "comment": "Include lodash dependency"
                }
            ],
            "remove": [
                {
                    "purl": "pkg:npm/deprecated-pkg@1.0.0",
                    "comment": "Remove deprecated package" 
                }
            ],
            "replace": [
                {
                    "path": "src/utils/helper.js",
                    "purl": "pkg:npm/old-lib@1.0.0",
                    "replace_with": "pkg:npm/new-lib@2.0.0",
                    "license": "MIT",
                    "comment": "Upgrade to newer version"
                }
            ]
        }
    }

Usage
-----

You can add your 'scanoss.json' on the root of your project


# Command Line Interface (CLI)

SBOM Workbench includes a CLI for managing configuration without launching the graphical interface. This is useful for automation, scripting, and headless environments.

## Getting Help

```bash
# Show all available commands
./sbom-workbench-1.27.0-linux-x86_64-app.AppImage --help

# Show version
./sbom-workbench-1.27.0-linux-x86_64-app.AppImage --version
```

## Configuration Commands

### Initialize Configuration

Creates the default configuration file at `~/.scanoss/sbom-workbench-settings.json`:

```bash
./sbom-workbench-1.27.0-linux-x86_64-app.AppImage config init
```

> **Note:** This command will fail if a configuration file already exists.

### API Management

The CLI allows you to manage multiple API configurations for connecting to different SCANOSS servers.

#### List Configured APIs

Display all configured APIs with their indices:

```bash
./sbom-workbench-1.27.0-linux-x86_64-app.AppImage config api list
```

**Example output:**
```
Configured APIs:
[0] https://api.scanoss.com [key set] (default)
[1] https://custom.scanoss-server.com
```

#### Add an API

Add a new API configuration:

```bash
# Add API with URL only (public SCANOSS API)
./sbom-workbench-1.27.0-linux-x86_64-app.AppImage config api add --url https://api.scanoss.com

# Add API with URL and API key
./sbom-workbench-1.27.0-linux-x86_64-app.AppImage config api add --url https://api.scanoss.com --key YOUR_API_KEY

# Add API and set it as the default
./sbom-workbench-1.27.0-linux-x86_64-app.AppImage config api add --url https://custom.server.com --key YOUR_KEY --default
```

#### Remove an API

Remove an API configuration by its index:

```bash
./sbom-workbench-1.27.0-linux-x86_64-app.AppImage config api rm --index 1
```

> **Note:** If you remove the default API, the default will automatically be adjusted to the last available API.

#### Set Default API

Change which API is used by default:

```bash
./sbom-workbench-1.27.0-linux-x86_64-app.AppImage config api default --index 0
```

## [Collaborative Workspace](COLLAB_WORKSPACE.md)

The SBOM Workbench includes support for a collaborative workspace, a feature designed to enhance teamwork. View more details [here](COLLAB_WORKSPACE.md).


## Contributing

SBOM Workbench is an open source project, and we love to receive contributions from our community. There are many ways to contribute. For more information see the [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## Docs

This project was made using Electron React Boilerplate

See [docs and guides here](https://electron-react-boilerplate.js.org/docs/installation)
