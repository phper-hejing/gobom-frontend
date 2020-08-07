import { WS_PING } from '../constant';

let callbackList = {
  [WS_PING]: function(ws, data) {
    ws.send(JSON.stringify(data));
  },
};

export default {
  namespace: 'websocket',

  state: {
    ws: null,
  },

  effects: {
    *init({ payload: data }, { put, select }) {
      let { url, callback } = data;

      let ws = new WebSocket(url);

      ws.onopen = function(event) {
        console.log('ws open connection');
        callback();
      };

      ws.onmessage = function(event) {
        let data = JSON.parse(event.data);
        if (data.error != '') {
          alert(data.error);
        }
        if (callbackList[data.type]) {
          callbackList[data.type](ws, data);
        } else {
          console.error(
            `type: ${data.type}未注册，请实现 type:${data.type} 的回调`,
          );
        }
      };

      ws.onerror = function(event) {
        console.log('ws error');
      };

      ws.onclose = function(event) {
        console.log('ws close connection');
      };

      yield put({ type: 'setWs', payload: ws });
    },
  },

  reducers: {
    setWs(state, { payload: ws }) {
      return {
        ...state,
        ws: ws,
      };
    },
    registerHandel(state, { payload: handel }) {
      callbackList = {
        ...callbackList,
        [handel.key]: handel.callback,
      };

      return {
        ...state,
      };
    },
  },
};
