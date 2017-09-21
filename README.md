# Montana News Archive [![Build Status](https://travis-ci.org/PronghornDigital/Montana-News-Archive.svg?branch=master)](https://travis-ci.org/PronghornDigital/Montana-News-Archive)

## Development

1. Install [NVM](https://github.com/creationix/nvm)
1. Install Node.js 4+
1. Create `./incoming` and `./data` for uploaded videos and psersistence, or
   configure `ARCHIVE_DATA_ROOT`
1. Install NPM dependencies
1. Run test suite
1. Start a webserver

```
nvm install 4 ; nvm alias default 4 # One-time thing to get the right Node.
cd path/to/project

mkdir incoming
# Alternatively, if you are uploading to a remote location, export this instead:
export ARCHIVE_INCOMING="/var/path/to/uploaded/vidoes"

npm install # The command shouldn't fail.
npm test # The tests should pass, and the command shouldn't fail.
npm start # The server will come up on localhost:8080, and print a banner.
```
## Deployment
In order to cut a new release, you must bump the version in `package.json`. Any merge into `master` that successfully passes testing in CI and has a bumped version in `package.json` will be packaged into an RPM and pushed to the [mtna package cloud repository][repo_url].

## Installation in Production
To make installation easier an install script is available to bootstrap your system. The script will add the [mtna package cloud repository][repo_url] to your RPM configuration and then install the mtna package.

```
curl https://raw.githubusercontent.com/PronghornDigital/mtna-server-cookbook/master/install.sh | bash
```

[repo_url]: https://packagecloud.io/PronghornDigital/mtna
