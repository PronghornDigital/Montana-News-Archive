var fs_1 = require('fs');
var commander = require('commander');
var files = commander
    .option('-o, --out <path>', 'Output file')
    .option('-p, --prefix <string>', 'Prefix to strip')
    .option('-m, --module <name>', 'Module name')
    .parseOptions(process.argv).args;
var outStream = process.stdout;
if ('out' in commander) {
    outStream = fs_1.createWriteStream(commander['out']);
}
var moduleName = 'templates';
if ('module' in commander) {
    moduleName = commander['module'];
}
var prefix = '';
if ('prefix' in commander) {
    prefix = commander['prefix'];
}
var prefixFilter = new RegExp("^" + prefix);
outStream.write("angular.module('" + moduleName + "', []);\n");
files
    .filter(function (_) { return _.match(/\.html$/) !== null; })
    .forEach(function (file) {
    var content = fs_1.readFileSync(file, 'utf-8')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '\\\'')
        .replace(/\r?\n/g, '\\n');
    var tplPath = file.replace(prefixFilter, '');
    outStream.write("angular.module('" + moduleName + "').run(['$templateCache', function(cache) { cache.put('" + tplPath + "', '" + content + "');}]);\n");
});
