import {
  spy, stub
} from 'sinon';

import {
  ILogger
} from 'ts-rupert';

let arrString = (_: any[]) => _.join(' ');
export function getMockLogger(): ILogger {
  let methods = [ 'silly', 'data', 'debug', 'verbose', 'http', 'info', 'log',
    'warn', 'error', 'silent', 'query', 'profile', ];
  let logger: any = {
    middleware: stub().returns((q: any, s: any, n: Function): void => n()),
    print: (): void => {
      methods.forEach((method: string) => {
        let level: string = console[method] ? method : 'log';
        console[level](`${method}: ${logger[method].args.map(arrString)}`);
      });
    }
  };

  methods.forEach((method: string) => {
    logger[method] = spy();
  });

  return <ILogger>logger;
}
