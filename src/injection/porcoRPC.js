import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import { sleep } from './utils';

const rpcVersion = 'porco-rpc';

export class PorcoRPCServer {
  constructor(origin) {
    this.origin = origin;
    this.requestPool = new Map();
    window.addEventListener('message', (event) => this.onResponse(event));
  }
  request(method, params, timeoutMs = 1000) {
    const { origin } = this;
    const id = uuidv4();
    const message = {
      jsonrpc: rpcVersion,
      id,
      method,
      params,
    };
    const rpcRequest = new Promise((resolve, reject) => {
      window.postMessage(message, origin);
      this.requestPool.set(id, { message, resolve, reject } );
    });
    const requestTimeout = sleep(timeoutMs).then(
      () => Promise.reject(new Error('timeout'))
    );
    return Promise.race([rpcRequest, requestTimeout]).finally(err => {
      this.requestPool.delete(id);
    });
  }
  onResponse(event) {
    const {
      data: {
        jsonrpc,
        id,
        result,
        error,
      }
    } = event;
    if (jsonrpc !== rpcVersion) {
      return;
    }
    const request = this.requestPool.get(id);
    if (request === undefined) {
      return;
    }
    if (result !== undefined) {
      request.resolve(result);  
    } else {
      request.reject(error);
    }
  }
}


export class PorcoRPCClient {
  constructor() {
    this.emitter = new EventEmitter();
    window.addEventListener('message', (event) => this.onRequest(event));
  }
  onRequest(event) {
    const {
      source,
      origin,
      data: {
        jsonrpc,
        id,
        method,
        params,
      }
    } = event;
    if (jsonrpc !== rpcVersion) {
      return;
    }
    const response = {
      jsonrpc, id
    }
    this.emitter.emit(
      method,
      id,
      params,
      (result) => {
        source.postMessage({ ...response, result }, origin);
      },
      (error) => {
        source.postMessage({ ...response, error }, origin);
      }
    )
  }
}
