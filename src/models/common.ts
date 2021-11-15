import { history } from 'umi';
import { setStore, getVersion } from '@/utils/lib';
import { axios } from '@/utils/axios';
import { getShowModel, getImageSize } from '@/pages/index/lib';
import { defaultImageSize } from '@/pages/index/Head';

const namespace = 'common';

export interface ICommon {
  version?: {};
  ip: string;
  showModel: boolean;
  imgHeight: number;
}
const defaultState: ICommon = {
  version: {},
  ip: '',
  // 显示模板图
  showModel: true,
  imgHeight: defaultImageSize,
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
      let ip = yield call(getIp);
      // authIP(ip);
      let showModel = getShowModel();
      let imgHeight = getImageSize();
      yield put({
        type: 'setStore',
        payload: {
          version,
          ip,
          showModel,
          imgHeight,
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
