IMAGE='jonathanporta/montana-news-archive:latest'
RELEASE_TAG=$(shell cat ./package.json | jq -r .version)
OWNER="PronghornDigital"
REPO="Montana-News-Archive"

install:
	yarn

build: install
	./node_modules/.bin/gulp

test: build
	./node_modules/.bin/gulp
	yarn run test:ci
	yarn run lint:ts
	yarn run lint:sass

package: build
	./ops/package.sh

release: package
	./ops/gh.sh upload ${OWNER}/${REPO} ${RELEASE_TAG} *.rpm

# For creating a local build environment - we don't expect to push this container anywhere - it's just for building our app.
local-build: local-docker

local-docker:
	docker build -t $(IMAGE) -f ./ops/Dockerfile .

local-dev: local-build
	docker run -v $(shell pwd):/app -P -it $(IMAGE)

local-shell: local-build
	docker run -v $(shell pwd):/app $(IMAGE) -it /bin/bash

clean:
	-yarn run clean
	-rm -f ./*.rpm
