import { axios, IAxiosState, DEV, _commonData, TDbWrite } from '@/utils/axios';

export interface IImageItem {
  id: number;
  img_url: string;
}
/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 获取100条图像核查待清洗数据 }
 */
export const getImgs: (manual_flag: string) => Promise<IImageItem[]> = (
  manual_flag,
) =>
  axios<IImageItem>({
    url: DEV ? '/mock/1391_188caccc16.json' : '/1391/188caccc16.json',
    params: {
      manual_flag,
    },
  }).then((res) => res.data);

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 更新数据清洗信息 }
 */
export const setImageJudge: (params: {
  audit_flag: number;
  _id: number[];
  ip: string;
}) => Promise<boolean> = (params) =>
  axios<TDbWrite>({
    url: DEV ? _commonData : '/1393/10aa1bc9e4.json',
    params,
  }).then(({ data: [{ affected_rows }] }) => affected_rows > 0);

export interface IAuditItem {
  id: number;
  img_url: string;
  username: string;
  audit_flag: string;
}
/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 按页获取用户判废结果 }
 */
export const getImageJudge: (params: {
  manual_flag: string;
  max_id: number;
}) => Promise<IAuditItem[]> = (params) =>
  axios<IAuditItem>({
    url: DEV ? '@/mock/1395_1b873dfb50.json' : '/1395/1b873dfb50.json',
    params,
  }).then((res) => res.data);

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 已判废结果分页索引 }
 */
export const getImageJudgePageIndex = () =>
  axios<{ pageNum: number; id: number }>({
    url: DEV ? '@/mock/1396_bf3f4dafb4.json' : '/1396/bf3f4dafb4.json',
  }).then((res) => res.data);

export interface IUserInfo {
  ip: string;
  id: number;
  username: string;
}
/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 用户信息查询 }
 */
export const getImageJudgeUsers: (ip: string) => Promise<IUserInfo> = (ip) =>
  axios<IUserInfo>({
    url: DEV ? '@/mock/1397_dfc44c5560.json' : '/1397/dfc44c5560.json',
    params: {
      ip,
    },
  }).then((res) => res.data?.[0]);

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 更新用户 }
 */
export const setImageJudgeUsers: (params: {
  username: string;
  ip: string;
}) => Promise<boolean> = (params) =>
  axios<TDbWrite>({
    url: DEV ? _commonData : '/1399/5ab9ff085b.json',
    params,
  }).then(({ data: [{ affected_rows }] }) => affected_rows > 0);

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 添加用户 }
 */
export const addImageJudgeUsers: (params: {
  ip: string;
  username: string;
}) => Promise<number | undefined> = (params) =>
  axios<TDbWrite>({
    url: DEV ? _commonData : '/1398/fab9688559.json',
    params,
  }).then(({ data: [{ id }] }) => id);

export const udpateUserInfo = (
  param: { ip: string; username: string },
  type: 'add' | 'update',
) => {
  return type == 'update'
    ? setImageJudgeUsers(param)
    : addImageJudgeUsers(param);
};
