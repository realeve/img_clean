import { axios, IAxiosState, DEV, _commonData, TDbWrite } from '@/utils/axios';
import * as R from 'ramda';

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
