# Montana News Archive

## Getting Started

1. Install [NVM](https://github.com/creationix/nvm)
1. Install Node.js 4+
1. Create `./incoming` for uploaded videos, or configure `ARCHIVE_INCOMING`
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
