import axios from 'axios';
import { PorcoRPCClient } from './porcoRPC';

const appID = '101007056';
const csrfToken = document.getElementsByName('csrf-token')[0].content;
const chuangyi = axios.create({
  baseURL: 'https://chuangyi.taobao.com/tools/smartPhrase',
  timeout: 1000,
  headers: {
    'x-csrf-token': csrfToken
  }
})

const rpcClient = new PorcoRPCClient();

rpcClient.emitter.on('generateSuit', async (id, params, onSuccess, onFail) => {
  const { numIID } = params;
  const resp = await chuangyi.post('/generateSuit', { appid: appID, id: numIID });
  const { data: { result } } = resp
  onSuccess(result);
});