/// <reference path="../node/node.d.ts" />

declare module busboy {

  interface IBusboyStatic {
    /**
     * Initialize a new `Busboy`.
     *
     */
    new (options:any):IBusboy;
  }

  interface IBusboy extends NodeJS.EventEmitter, NodeJS.WritableStream {

  }
}

declare module "busboy" {
  let b:busboy.IBusboyStatic;
  export = b;
}
