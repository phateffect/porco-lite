import axios from 'axios';
import EventEmitter from 'events';
import logger from './logger';

const eventEmitter = new EventEmitter();

class PorcoClient {
  constructor() {
    this.session = axios.create({
      baseURL: porcoServer,
      timeout: 1000,
      headers: { 'X-Porco-Version': porcoVersion },
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

  comments.filter(c => c.renders.render_anchor === undefined).map(c => eventEmitter.emit('porco#comment', c));
  await porco.session.post(`/shows/${showID}/comments`, { comments });
});

eventEmitter.on('mtop.mediaplatform.live.pulltopicstat', async result => {
  /* 这些都是string */
  const {
    data: { digNum, msgNum, onlineNum, totalNum, visitNum }
  } = result;
});

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
