import request from '../utils/request';
import { REQUEST_URL } from '../constant';

const dataUrl = REQUEST_URL + '/script';
const addUrl = REQUEST_URL + '/script/add';
const editUrl = REQUEST_URL + '/script/edit';
const delUrl = REQUEST_URL + '/script/delete';
const testUrl = REQUEST_URL + '/script/test';

export default {
  namespace: 'script',
  state: {
    script: {},
    scriptList: [],
  },
  effects: {
    *getScriptList(_, { call, put }) {
      const resp = yield call(request, dataUrl);
      if (resp.msg == '') {
        yield put({ type: 'setScriptList', payload: resp.data });
      }
      return resp;
    },
    *getScript({ payload: id }, { call, put }) {
      const script = yield call(request, dataUrl, {
        body: {
          id: id,
        },
      });
      yield put({ type: 'setScript', payload: script });
    },
    *addScript({ payload: script }, { call, put }) {
      script.data = JSON.stringify(script.data);
      return yield call(request, addUrl, {
        body: JSON.stringify(script),
      });
    },
    *editScript({ payload: script }, { call, put }) {
      script.data = JSON.stringify(script.data);
      return yield call(request, editUrl, {
        body: JSON.stringify(script),
      });
    },
    *delScript({ payload: id }, { call, put }) {
      return yield call(request, delUrl, {
        body: JSON.stringify({
          id: id,
        }),
      });
    },
    *testScript({ payload: script }, { call, put }) {
      script.data = JSON.stringify(script.data);
      return yield call(request, testUrl, {
        body: JSON.stringify(script),
      });
    },
  },
  reducers: {
    setScriptList(state, { payload: scriptList }) {
      return {
        ...state,
        scriptList: scriptList,
      };
    },
    setScript(state, { payload: script }) {
      return {
        ...state,
        script: script,
      };
    },
  },
};
