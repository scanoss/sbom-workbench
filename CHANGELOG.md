# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Upcoming changes ...

### Fixed
- Fixed malformed PURLs in crypto exports when version contains special characters like `@`


## [1.26.1] - 2025-11-20
### Security
  - Upgraded glob package to address command injection vulnerability (CVE-2025-64756)

## [1.26.0] - 2025-11-17
### Fixed
- Prevented deletion of `https://api.osskb.org` default URL
- Fixed Monaco editor decorations not being cleared when switching files
### Added
- Added real-time URL validation with pathname removal and warning message
- Added migration to remove pathname from API URL from `sbom-workbench-settings.json` file
- Added validation to prevent duplicate API URL and API KEY combinations in settings
- Added `https://` prefix on new API URL creation
### Changed
- Upgraded scanoss.js SDK version to v0.27.0
- Improved API endpoint deletion to check both URL and API KEY for unique identification
- Increased default request chunk limits

## [1.25.0] - 2025-11-05
### Added
- Added fh2 support
- Added comments on CSV SBOM export output
- Added option to copy file path to clipboard on cryptography search screen
- Displayed detected cryptography for a selected file in cryptography search screen
- Displayed detected keys and keywords on crypto viewer component
- Included dependency files on local cryptography scanning
### Changed
- Upgraded `scanoss.js` version to v0.26.0

## [1.24.0] - 2025-10-27
### Added
- Added spinner to component list in detected/identified report pages
- Added detected/concluded component URL to CSV export
- Added cryptography search
- Added cryptography highlight
- Added navigation from detected/identified crypto to search crypto screen
- Added clickable line navigation to crypto matches panel
### Changed
- Improved error logging for setting file handling
- Update configuration alerts translations and enhance link handling in project settings

[1.24.0]: https://github.com/scanoss/sbom-workbench/tag/v1.24.0
[1.25.0]: https://github.com/scanoss/sbom-workbench/compare/v1.24.0...v1.25.0
[1.26.0]: https://github.com/scanoss/sbom-workbench/compare/v1.25.0...v1.26.0
[1.26.1]: https://github.com/scanoss/sbom-workbench/compare/v1.26.0...v1.26.1

