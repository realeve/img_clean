import { axios, IAxiosState, DEV, _commonData, TDbWrite } from '@/utils/axios';
import * as R from 'ramda';

import { imageHost } from '@/utils/setting';

export {
  getImageJudgeUsersList,
  udpateUserInfo,
  getImageJudgeUsers,
} from '@/pages/index/db';

export interface IErrorTypeItem {
  proc_name: string;
  err_type: string;
  err_typeid: number;
}
/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 缺陷类型列表 }
 */
export const getImageErrtype = () =>
  axios<IErrorTypeItem>({
    url: DEV ? '@/mock/error_type.json' : '/1465/a9fd0c03b2.json',
  }).then((res) => res.data);

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 分类完工量统计 }
 */
export const getImageClass = () =>
  axios<{ username: string; fake_nums: number }>({
    url: DEV ? '@/mock/1408_71e7266837.json' : '/1468/a1509e4564.json',
  })
    .then((res) => res.data)
    .catch((e) => []);

export interface IClassItem {
  type: string;
  img_url: string;
  ai_flag: null | number;
  id: number;
  imageIdx: number;
}
/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 领取分类任务 }
 */
export const getImageClassTask = () =>
  axios<IClassItem>({
    url: DEV ? '@/mock/1469_ede3539713.json' : '/1469/ede3539713.json',
  }).then((res) =>
    res.data.map((item, idx) => {
      let url = item.type == null ? '' : `/${item.type}/`;
      item.img_url = imageHost + (url + item.img_url).replace(/\/\//g, '/');
      item.imageIdx = idx + 1;
      return item;
    }),
  );
