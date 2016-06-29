#!/bin/bash

if [ -z "$TRAVIS_BUILD_NUMBER" ]; then
  echo "TRAVIS_BUILD_NUMBER is not set. Please do not push locally built packages outside of the CI pipeline."
  exit 1
fi

package_cloud version
package_cloud push PronghornDigital/mtna/fedora/23 ./*.rpm
package_cloud push PronghornDigital/mtna/fedora/24 ./*.rpm
