import {
  Writable
} from 'stream';

import {
  createWriteStream,
  readFileSync
} from 'fs';

import * as commander from 'commander';

let files: string[] = commander
  .option('-o, --out <path>', 'Output file')
  .option('-p, --prefix <string>', 'Prefix to strip')
  .option('-m, --module <name>', 'Module name')
  .parseOptions(process.argv).args;

let outStream: Writable = <Writable>process.stdout;
if ('out' in commander) {
  outStream = createWriteStream(commander['out']);
}

let moduleName: string = 'templates';
if ('module' in commander) {
  moduleName = commander['module'];
}

let prefix: string = '';
if ('prefix' in commander) {
  prefix = commander['prefix'];
}
let prefixFilter = new RegExp(`^${prefix}`);

outStream.write(`angular.module('${moduleName}', []);\n`);

files
.filter((_) => _.match(/\.html$/) !== null)
.forEach((file) => {
  let content: string = readFileSync(file, 'utf-8')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '\\\'')
    .replace(/\r?\n/g, '\\n')
    ;
  let tplPath: string = file.replace(prefixFilter, '');
  /* tslint:disable */
  outStream.write(`angular.module('${moduleName}').run(['$templateCache', function(cache) { cache.put('${tplPath}', '${content}');}]);\n`);
  /* tslint:enable */
});
