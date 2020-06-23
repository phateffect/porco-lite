import axios from 'axios';
import logger from './logger';
import EventEmitter from 'events';


const eventEmitter = new EventEmitter();

class PorcoClient {
  constructor() {
    this.session = axios.create({
      baseURL: 'http://localhost:5000/api',
      timeout: 1000,
      headers: {'X-Porco-Version': 'dev'}
    });
  }
  sendToServer(payload, resp) {
    const { api } = resp;
    eventEmitter.emit(api, resp);
  }
  recordError() {
  }
}

const porco = new PorcoClient();
let showID = null; 

eventEmitter.on('mtop.taobao.iliad.comment.query.anchorlatest', async (result) => {
  if (showID === null) {
    return;
  }
  console.log('comment', result);
  const { data: { comments } } = result;
  if (comments === undefined) {
    return;
  }
  console.log('comment-', comments);
  await porco.session.post(`/shows/${showID}/comments`, { comments })
});

async function updateLive() {
  if (window.pageData === undefined || window.pageData.liveDO === undefined) {
    logger.info('live info not found');
    setTimeout(updateLive, 1000);
    return false;
  }
  const { liveDO, liveDO: { id } } = window.pageData;
  showID = id;
  const resp = await porco.session.put(`/shows/${showID}`, liveDO);
  console.log(resp);
}

function patch() {
  if (window.lib === undefined || window.lib.mtop === undefined) {
    logger.info('porco skip');
    setTimeout(patch, 1000)
    return false;
  }

  const origin = lib.mtop.request;

  lib.mtop.request = (payload, _onSuccess, _onFail) => {
    function onSuccess(resp) {
      _onSuccess(resp);
      porco.sendToServer(payload, resp)
    }
    function onFail(error) {
      _onFail(error);
      porco.recordError(payload, error)
    }

    return origin(payload, onSuccess, onFail);
  }
  logger.info('porco patched');
  return true;
}

patch();
updateLive();