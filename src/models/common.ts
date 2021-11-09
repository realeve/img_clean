import { history } from 'umi';
import { setStore, getVersion } from '@/utils/lib';
import { axios } from '@/utils/axios';

const namespace = 'common';

export interface ICommon {
  version?: {};
  ip: string;
}
const defaultState: ICommon = {
  version: {},
  ip: '',
};

// 获取ip
const getIp = () =>
  axios({
    url: '/ip',
  })
    .then((res) => {
      window.localStorage.setItem('ip', res.ip);
      return res.ip;
    })
    .catch((e) => {
      console.error('IP地址获取失败');
      return '0.0.0.0';
    });

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
      let ip = yield call(getIp);
      // authIP(ip);

      yield put({
        type: 'setStore',
        payload: {
          ip,
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
