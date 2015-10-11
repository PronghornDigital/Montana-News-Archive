import * as glob from 'glob';

let i = 1;
let matcher = new RegExp(`${__filename}$`);
process.argv.forEach((_, j) => {
  if (matcher.test(_)) { i = j; }
});
process.argv.slice(i).forEach(_ => glob(_, printAll));

function printAll(err: any, files: string[]): void {
  files.map(_ => process.stdout.write(_ + ' '));
}
