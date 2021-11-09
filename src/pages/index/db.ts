import {
  axios,
  IAxiosState,
  AxiosError,
  DEV,
  mock,
  _commonData,
  TDbWrite,
} from '@/utils/axios';
import useFetch, { IFetchState } from '@/utils/useFetch';

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 获取100条图像核查待清洗数据 }
 */
export const getImageJudge: (manual_flag: string) => Promise<IAxiosState> = (
  manual_flag,
) =>
  axios({
    url: DEV ? '@/mock/1391_188caccc16.json' : '/1391/188caccc16.json',
    params: {
      manual_flag,
    },
  });

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 图像核查待清洗数据总量 }
 */
export const getImageJudgeCount: () => Promise<IAxiosState> = () =>
  axios({
    url: DEV ? undefined : '/1392/70919f0f45.json',
  });

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 更新数据清洗信息 }
 */
export const setImageJudge: (params: {
  audit_flag: string;
  _id: string;
}) => Promise<boolean> = (params) =>
  axios<TDbWrite>({
    url: DEV ? _commonData : '/1393/10aa1bc9e4.json',
    params,
  }).then(({ data: [{ affected_rows }] }) => affected_rows > 0);
