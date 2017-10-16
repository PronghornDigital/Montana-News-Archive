#!/bin/bash

if [ -z "$CI" ]; then
  echo "CI is not set in the environment. Please do not push locally built packages outside of the CI pipeline."
  exit 1
fi

project=$(cat package.json | jq -r .name)
version=$(cat package.json | jq -r .version)
iteration="$CIRCLE_BUILD_NUM.git$(git rev-parse --short HEAD)"
architecture='x86_64'
url="https://github.com/PronghornDigital/Montana-News-Archive"
vendor=$(cat package.json | jq -r .author)
description=$(cat package.json | jq -r .description)
install_prefix="/opt/PronghornDigital/${project}"

cat << EOF
  Building RPM...
  Project: $project
  Version: $version
  Iteration: $iteration
  Architecture: $architecture
  Project URL: $url
  Vendor: $vendor
  Description: $description
  Install Prefix: $install_prefix
EOF

fpm -s dir -t rpm \
    --name "${project}" \
    --version "${version}" \
    --iteration "${iteration}" \
    --architecture "${architecture}" \
    --url "${url}" \
    --vendor "${vendor}" \
    --description "${description}" \
    --prefix "$install_prefix" \
    dist/ \
    node_modules/ \
    package.json \
    gulpfile.js \
    README.md
