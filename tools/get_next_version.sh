 #!/bin/bash
 # SPDX-License-Identifier: GPL-2.0-only
 #
 #   Copyright (c) 2024, SCANOSS
 #
 #   Permission is hereby granted, free of charge, to any person obtaining a copy
 #   of this software and associated documentation files (the "Software"), to deal
 #   in the Software without restriction, including without limitation the rights
 #   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 #   copies of the Software, and to permit persons to whom the Software is
 #   furnished to do so, subject to the following conditions:
 #
 #   The above copyright notice and this permission notice shall be included in
 #   all copies or substantial portions of the Software.
 #
 #   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 #   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 #   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 #   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 #   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 #   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 #   THE SOFTWARE.
 ###
 #
 # Get the defined package version and compare to the latest tag. Echo the new tag if it doesn't already exist.
 #


# Method 1: Using the BASH_SOURCE variable
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PACKAGE_JSON_FILE_PATH="$SCRIPT_DIR/../release/app/package.json"

 # Check if jq is installed
 if ! command -v jq &> /dev/null; then
     echo "Error: jq is not installed. Please install it first."
     echo "You can install it with: sudo apt-get install jq (Ubuntu/Debian)"
     echo "Or: brew install jq (macOS with Homebrew)"
     exit 1
 fi

 # Check if file is provided
 if [ -z "$PACKAGE_JSON_FILE_PATH" ]; then
     echo "Usage: $0 <json_file>"
     exit 1
 fi

 # Check if file exists
 if [ ! -f "$PACKAGE_JSON_FILE_PATH" ]; then
     echo "Error: File $1 does not exist."
     exit 1
 fi

 # Extract version from JSON file
 VERSION=$(jq -r '.version' "$PACKAGE_JSON_FILE_PATH")

 # Check if version was found
 if [ "$VERSION" = "null" ]; then
     echo "Error: Could not find 'version' field in the JSON file."
     exit 1
 fi

# Get latest git tagged version
LATEST_TAGGED_VERSION=$(git describe --tags --abbrev=0)
if [[ -z "$LATEST_TAGGED_VERSION" ]] ; then
  LATEST_TAGGED_VERSION=$(git describe --tags "$(git rev-list --tags --max-count=1)")
fi
if [[ -z "$LATEST_TAGGED_VERSION" ]] ; then
  echo "Error: Failed to determine a valid version number" >&2
  exit 1
fi

# Convert to semver (with 'v' prefix)
SEMVER_SBOM_WORKBENCH="v$VERSION"
echo "Latest Tag: $LATEST_TAGGED_VERSION, SBOM-Workbench Version: $SEMVER_SBOM_WORKBENCH" >&2
# If the two versions are the same abort, as we don't want to apply the same tag again
if [[ "$LATEST_TAGGED_VERSION" == "$SEMVER_SBOM_WORKBENCH" ]] ; then
  echo "Latest tag and SBOM-Workbench version are the same: $SEMVER_SBOM_WORKBENCH" >&2
  exit 1
fi
echo "$SEMVER_SBOM_WORKBENCH"
exit 0
