#!/usr/bin/env bash
set -e

VERSION=$(git rev-parse --short HEAD)
echo "Injecting version: $VERSION"

find . -type f \( -name "*.html" -o -name "*.js" \) -exec sed -i "s/__VERSION__/$VERSION/g" {} +