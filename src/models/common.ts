import { history } from 'umi';
import { setStore, getVersion } from '@/utils/lib';

const namespace = 'common';

export interface ICommon {
  version?: {};
}
const defaultState: ICommon = {
  version: {},
};

export default {
  namespace,
  state: defaultState,
  reducers: {
    setStore,
  },
  effects: {
    *getVersion(_, { call, put }) {
      let version = yield call(getVersion);
      yield put({
        type: 'setStore',
        payload: {
          version,
        },
      });
    }, // 获取版本信息
  },
  subscriptions: {
    setup({ dispatch, history }) {
      dispatch({
        type: 'getVersion',
      });
    },
  },
};
