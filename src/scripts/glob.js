var glob = require('glob');
var i = 1;
var matcher = new RegExp(__filename + "$");
process.argv.forEach(function (_, j) {
    if (matcher.test(_)) {
        i = j;
    }
});
process.argv.slice(i).forEach(function (_) { return glob(_, printAll); });
function printAll(err, files) {
    files.map(function (_) { return process.stdout.write(_ + ' '); });
}
