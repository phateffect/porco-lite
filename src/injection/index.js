import axios from 'axios';
import EventEmitter from 'events';
import logger from './logger';

const eventEmitter = new EventEmitter();

class PorcoClient {
  constructor() {
    this.session = axios.create({
      baseURL: 'https://porco.yaosuguoduo.com/api',
      timeout: 1000,
      headers: { 'X-Porco-Version': 'dev' },
    });
  }
  reply(commentId, content, isPublic=true) {
    return window.lib.mtop.request({
      api: 'mtop.taobao.iliad.comment.publish',
      v: '1.0',
      data: {
        topic: window.pageData.liveDO.topic,
        content,
        isReply: true,
        replyToCommentId: commentId,
        isPrivate: !isPublic,
        namespace: '200001'
      }
    });
  }
}

const porco = new PorcoClient();
window.porco = porco;
let showID = null;

eventEmitter.on('mtop.taobao.iliad.comment.query.anchorlatest', async result => {
  if (showID === null) {
    return;
  }
  const {
    data: { comments },
  } = result;
  if (comments === undefined) {
    return;
  }
  await porco.session.post(`/shows/${showID}/comments`, { comments });
});

/*
eventEmitter.on('mtop.mediaplatform.live.pulltopicstat', async result => {
{
  "api": "mtop.mediaplatform.live.pulltopicstat",
  "data": {
    "digNum": "23924",
    "msgNum": "171024",
    "onlineNum": "540",
    "totalNum": "28933",
    "visitNum": "55505"
  },
  "ret": [
    "SUCCESS::调用成功"
  ],
  "v": "1.0"
}
});
*/

async function updateLive() {
  if (window.pageData === undefined || window.pageData.liveDO === undefined) {
    logger.info('live info not found');
    setTimeout(updateLive, 1000);
    return false;
  }
  const {
    liveDO,
    liveDO: { id },
  } = window.pageData;
  showID = id;
  await porco.session.put(`/shows/${showID}`, liveDO);
  return true;
}

function patch() {
  if (window.lib === undefined || window.lib.mtop === undefined) {
    logger.info('porco skip');
    setTimeout(patch, 1000);
    return false;
  }

  const origin = window.lib.mtop.request;

  window.lib.mtop.request = (payload, _onSuccess, _onFail) => {
    function onSuccess(resp) {
      _onSuccess(resp);
      const { api } = resp;
      eventEmitter.emit(api, resp);
    }
    function onFail(error) {
      _onFail(error);
    }
    return origin(payload, onSuccess, onFail);
  };
  logger.info('porco patched');
  return true;
}

patch();
updateLive();
