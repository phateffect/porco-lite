import _debug from 'debug';

const prefix = 'porco';

const logger = {
  debug: _debug(`${prefix}:debug`),
  verbose: _debug(`${prefix}:verbose`),
  info: _debug(`${prefix}:info`),
  warn: _debug(`${prefix}:warn`),
  error: _debug(`${prefix}:error`),
  fatal: _debug(`${prefix}:fatal`),
};

export default logger;