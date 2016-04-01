# MTNA Docs


## Contributing

If you find any problems in the docs or have a question, open an issue. Please submit edits & additions as pull requests against the appropriate branch.

Once we have sufficient content, we will branch open source release versions. Master branch will reflect vanillaforums.com production.

### Organization

Picking a location for your docs is important. Moving a doc later may break its URL.

The "Features" folder is for all users of Vanilla Forums but descriptions may include services and features specific to the VanillaForums.com hosted service.

The "Developers" folder is for all developers implementing their own code solutions for Vanilla Forums but may include descriptions of solutions that are not possible or disallowed on VanillaForums.com hosted service. Clients of VanillaForums.com should consult support or their sales representative for guidance.

The "Cloud" folder is for clients of Vanilla Forums, Inc. and our cloud hosting product.

### Formatting

* Every doc file must end in `.html.md` and be formatted in Markdown.
* Use H1 (`#` in Markdown) as your top-level headings in each file (and only once).
* Use H2 (`##` in Markdown) for major sub-topics and H3 (`###`) for minor headings.
* All images go within [`docs/images`](docs/images) and must be referenced absolutely (`/images/foo.png`).
* Use descriptive image names that include their topic area and what they depict, and `hyphenate-the-names.png`.

### Writing

* Be brief but clear.
* Carefully consider organization.
* Cross-reference with links liberally.
* Break up long sentences and paragraphs.

## Technical Setup

### YAML Meta

The following meta data can be defined in the YAML Front Matter block of each document:

Key           | Type    | Description
---           | ---     | ---
`title`       | String  | Title of the page. Will appear in the search results, breadcrumbs, sidebar, and `<title>` tag.
`description` | String  | Description used in the `<meta name="description">` tag.
`categories`  | Array   | Array of document categories. Used for the search results.
`order`       | Integer | Document order. Used for sorting in breadcrumbs and sidebar (low to high).
`menu`        | String  | Optional title for use in breadcrumbs and sidebar.
`hidden`      | Boolean | Whether or not to hide the document from breadcrumbs and sidebar.
`keywords`    | Array   | Array of keywords used in the `<meta name="keywords">` tag.

### Running locally

The following instructions assume that you have already installed Node.js on your computer. If this is not the case, please download and install the latest stable release from the official [Node.js download page](http://nodejs.org/download/). If you are using [Homebrew](http://brew.sh/), you can also install Node.js via the command line:

```sh
$ brew install node
```

> __Notice__: It is important that you install Node in a way that does not require you to `sudo`.

Once you have Node.js up and running, you will need to install the local dependencies using [npm](http://npmjs.org):

```sh
$ npm install
```

### Tasks

The following commands are available to be run from the root of the repository:

##### Start - `npm start`
Boots up a local development server and takes care of compiling docs pages, scripts, and stylesheets whenever they change.

##### Build - `npm run build`
One-time compilation of docs pages, scripts, and stylesheets. Will also inject Bower-managed dependencies and optimize all output files for deployment.

##### Deploy - `npm run deploy`
Similar to `npm run build` but will also deploy the output files to the `gh-pages` branch.  
:bangbang: __This task can currently only be run by Travis CI.__

##### Clean - `npm run clean`
Cleans out the temporary and distribution directories created by the above tasks.

---
Copyright &copy; 2014 [Vanilla Forums Inc](http://vanillaforums.com). All rights reserved.
