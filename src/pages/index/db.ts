import { axios, IAxiosState, DEV, _commonData, TDbWrite } from '@/utils/axios';

export interface IImageItem {
  id: number;
  img_url: string;
  imageIdx: number;
}
/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 获取100条图像核查待清洗数据 }
 */
export const getImgs: (params: {
  manual_flag: string;
  ip: string;
}) => Promise<IImageItem[]> = (params) =>
  axios<IImageItem>({
    url: DEV ? '/mock/1391_188caccc16.json' : '/1391/188caccc16.json',
    params,
  }).then((res) =>
    res.data.map((item, i) => {
      return { ...item, imageIdx: i + 1 };
    }),
  );

/**
*   @database: { 生产指挥中心BI数据 }
*   @desc:     { 领用一组判废图片 } 
	以下参数在建立过程中与系统保留字段冲突，已自动替换:
	@id:_id. 参数说明：api 索引序号 
*/
export const receiveImageJudge: (data: {
  ip: string;
  _id: number[];
}) => Promise<boolean> = (data) =>
  axios<TDbWrite>({
    method: 'post',
    url: DEV ? _commonData : '/1400/28acffdf50.json',
    data,
  }).then(({ data: [{ affected_rows }] }) => affected_rows > 0);

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 更新数据清洗信息 }
 */
export const setImageJudge: (
  params: {
    audit_flag: number;
    _id: number[];
    ip: string;
  },
  isCheckPage: boolean,
) => Promise<boolean> = (params, isCheckPage) =>
  axios<TDbWrite>({
    url: DEV
      ? _commonData
      : isCheckPage
      ? '/1407/1461a10c5f.json'
      : '/1393/10aa1bc9e4.json',
    params,
  }).then(({ data: [{ affected_rows }] }) => affected_rows > 0);

export interface IAuditItem {
  id: number;
  img_url: string;
  username: string;
  audit_flag: string;
  imageIdx: number;
  check_ip?: string;
}
/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 按页获取用户判废结果 }
 */
export const getImageJudge: (params: {
  manual_flag: string;
  max_id: number;
  audit_flag: number[];
}) => Promise<IAuditItem[]> = (params) =>
  axios<IAuditItem>({
    url: DEV ? '@/mock/1395_1b873dfb50.json' : '/1395/1b873dfb50.json',
    params: {
      audit_flag: [0, 1],
      ...params,
    },
  }).then((res) =>
    res.data.map((item, i) => {
      return { ...item, imageIdx: i + 1 };
    }),
  );

export const getImageJudgeByIp: (params: {
  manual_flag: string;
  max_id: number;
  ip: string;
  audit_flag: number[];
}) => Promise<IAuditItem[]> = (params) =>
  axios<IAuditItem>({
    url: DEV ? '@/mock/1395_1b873dfb50.json' : '/1406/65071cf8aa.json',
    params: {
      audit_flag: [0, 1],
      ...params,
    },
  }).then((res) =>
    res.data.map((item, i) => {
      return { ...item, imageIdx: i + 1 };
    }),
  );

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 已判废结果分页索引 }
 */
export const getImageJudgePageIndex = (
  audit_flag: number[],
  manual_flag = '0',
) =>
  axios<{ pageNum: number; id: number }>({
    url: DEV ? '@/mock/1396_bf3f4dafb4.json' : '/1396/bf3f4dafb4.json',
    params: { audit_flag, manual_flag },
  }).then((res) => res.data);

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 指定人员判废结果 }
 */
export const getImageJudgePageIndexByIp = (
  ip: string,
  audit_flag: number[],
  manual_flag = '0',
) =>
  axios<{ pageNum: number; id: number }>({
    url: DEV ? '@/mock/1396_bf3f4dafb4.json' : '/1405/3c6b921692.json',
    params: {
      ip,
      audit_flag,
      manual_flag,
    },
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

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 判废人员列表 }
 */
export const getImageJudgeUsersList: () => Promise<
  { id: number; ip: string; username: string }[]
> = () =>
  axios<{ id: number; ip: string; username: string }>({
    url: DEV ? '@/mock/1404_079e04aa25.json' : '/1404/079e04aa25.json',
  }).then((res) => [{ id: 0, ip: '', username: '所有人' }, ...res.data]);

/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 完工量统计 }
 */
export const getImageJudgeNum = () =>
  axios<{ username: string; fake_nums: number }>({
    url: DEV ? '@/mock/1408_71e7266837.json' : '/1408/71e7266837.json',
  }).then((res) => res.data);
