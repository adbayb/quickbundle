#!/usr/bin/env bash

# Run the script only in non CI environment (ie. if CI env is not set):
[[ -z "${CI}" ]] && echo "Running postinstall script..." || exit 0

# Go to the project root folder and link locally the module:
pushd ../../
yarn build
yarn link

# Go back to the example folder and link quickbundle:
popd
yarn link quickbundle
