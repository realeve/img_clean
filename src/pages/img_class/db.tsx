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
  ai_flag1: number;
  ai_flag2: number;
  ai_flag3: number;
  ai_flag4: number;
  ai_flag5: number;
  pred1: number;
  pred2: number;
  pred3: number;
  pred4: number;
  pred5: number;
  err_type1: string;
  err_type2: string;
  err_type3: string;
  err_type4: string;
  err_type5: string;
  id: number;
}

const handleImageItem = (item: IClassItem) => {
  // let url = item.type == null ? '' : `/${item.type}/`;
  let url = '';
  item.img_url = imageHost + (url + item.img_url).replace(/\/\//g, '/');
  return item;
};

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 领取分类任务 }
 */
export const getImageClassTask = () =>
  axios<IClassItem>({
    url: DEV ? '@/mock/1469_ede3539713.json' : '/1469/ede3539713.json',
  }).then((res) => res.data.map(handleImageItem));

/**
*   @database: { 生产指挥中心BI数据 }
*   @desc:     { 类型标记 } 
以下参数在建立过程中与系统保留字段冲突，已自动替换:
@id:_id. 参数说明：api 索引序号 
*/
export const setImageClass: (params: {
  audit_flag: number;
  ip: string;
  audit_date: string;
  _id: number | number[];
}) => Promise<boolean> = (params) =>
  axios<TDbWrite>({
    url: DEV ? _commonData : '/1470/83e450260c.json',
    params,
  }).then(({ data: [{ affected_rows }] }) => (affected_rows as number) > 0);

export interface IResultItem extends IClassItem {
  err_type: string;
}
/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 标记结果 }
 */
export const getImageClassResult = (maxId: number) =>
  axios<IResultItem>({
    url: DEV ? '@/mock/1471_d090e74911.json' : '/1471/d090e74911.json',
    params: {
      maxId,
    },
  })
    .then((res) => res.data)
    .then((res) => res.map(handleImageItem));

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 分页信息 }
 */
export const getImageClassPageIndex = () =>
  axios({
    url: DEV ? '@/mock/1472_a8f348d604.json' : '/1472/a8f348d604.json',
  }).then((res) => res.data);

export interface IAccItem {
  right_pic3: string;
  right_pic: string;
  total_pic: string;
  acc: string;
  acc3: string;
  right_pic_proc: string;
  acc_proc: string;
}
/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { AI Top1 top3准确率 }
 */
export const getImageClassAcc = () =>
  axios<IAccItem>({
    url: DEV ? '/@/mock/1481_6ee1b33a8c.json' : '/1481/6ee1b33a8c.json',
  }).then((res) => res.data[0]);

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 缺陷类型列表 }
 */
export const getErrorType = () =>
  axios<IClassItem>({
    url: DEV ? '@/mock/1482_ecf48c292d.json' : '/1482/ecf48c292d.json',
  }).then((res) => res.data.map(handleImageItem));
