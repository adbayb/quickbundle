#!/usr/bin/env bash

# Go to the project root folder and link locally the module:
pushd ../../
yarn build
yarn link

# Go back to the example folder and link quickbundle:
popd
yarn link quickbundle
