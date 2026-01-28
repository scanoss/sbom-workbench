# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.31.0] - 2026-01-28
### Added
- Added multiplatform shared workspace support
- Added migration to include scan sources in workspace configuration
- Added validation to prevent creating duplicated workspaces
- Added validation to prevent using 'sources' as a project name
- Added validation to prevent workspace folder from being selected as source folder
### Fixed
- Fixed diff view synchronized scrolling between left and right editors
- Fixed `null` licenses on detected report
### Changed
- Refactored search index to support multiplatform shared workspaces
- Upgraded scanoss.js SDK version to v0.30.1


## [1.30.1] - 2026-01-22
### Fixed
- Fixed cryptography analysis blacklist logic to correctly exclude hidden files, binary files, and configuration files

## [1.30.0] - 2026-01-15
### Added
- Added keyboard shortcuts for code viewer zoom (Cmd/Ctrl + +/-, Cmd/Ctrl + 0 to reset)
- Added mouse wheel zoom support in code viewer (Cmd/Ctrl + scroll)
- Added component URL to dependency data
- Included dependency component URL in detected/identified reports
- Added URL column to dependency table in HTML report
- Added external link icon with tooltip to dependency tree for opening component URL
- Added URL column with external link icon to license matches report table
- Made purl text selectable in dependency tree for copying
### Fixed
- Fixed proxy configuration not being loaded in settings modal
- Fixed errors when closing a project while async operations are in-flight
- Fixed database closed errors when navigating away from report pages during data loading
### Changed
- Improved error dialog layout for long messages (responsive width, word-break support)
- Changed project list to show total number of files instead of scanned files
- Updated scanned files translation to show progress format (scanned/total) in all languages

## [1.29.0] - 2025-12-02
### Added
- Added configurable pipeline stages in project settings (Dependencies, Vulnerabilities, Cryptography, Search Index)
### Changed
- Enhanced vulnerability reports with CVSS severity scores and metrics

## [1.28.0] - 2025-12-22
### Added
- Added read/write stream support to read scan raw results
- Added virtualization in cryptography viewer component
- Added search bar to cryptography viewer component
- Improved cryptography viewer component performance
### Fixed
- Fixed pre selected license in inventory dialog
- Fixed local cryptography scanning to include all project files, excluding only configuration files at the project root
### Changed
- Upgrades `scanoss.js` SDK version to v0.29.0

## [1.27.0] - 2025-12-12
### Added
  - App distribution for Windows (.zip with .exe bundle)
  - App distribution for macOS (.zip with .app bundle)
  - Added CLI support for API management (`config init`, `config api list/add/rm/default`)
  - Added CLI documentation
### Fixed
- Fixed malformed PURLs in crypto exports when version contains special characters like `@`
- Workspace configuration not persisting when clicking "Switch to default workspace" (#855, #856)
### Changed
- Improved error handling for unzip stage
- Upgraded scanoss.js SDK version to v0.28.1
- Use requirement as fallback version when dependency scanner returns no version
- Upgraded @cyclonedx/cyclonedx-library to v9.4.1 to fix critical libxmljs2 vulnerability (GHSA-78h3-pg4x-j8cv)
- Improved workspace error handling with better dialog options for missing or inaccessible workspace folders


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
[1.27.0]: https://github.com/scanoss/sbom-workbench/compare/v1.26.1...v1.27.0
[1.28.0]: https://github.com/scanoss/sbom-workbench/compare/v1.27.0...v1.28.0
[1.29.0]: https://github.com/scanoss/sbom-workbench/compare/v1.28.0...v1.29.0
[1.30.0]: https://github.com/scanoss/sbom-workbench/compare/v1.29.0...v1.30.0
[1.30.1]: https://github.com/scanoss/sbom-workbench/compare/v1.30.0...v1.30.1
[1.31.0]: https://github.com/scanoss/sbom-workbench/compare/v1.30.1...v1.31.0

