import { axios, IAxiosState, DEV, _commonData, TDbWrite } from '@/utils/axios';

export interface IImageItem {
  id: number;
  img_url: string;
}
/**
 *   @database: { 生产指挥中心BI数据 }
 *   @desc:     { 获取100条图像核查待清洗数据 }
 */
export const getImgs: (manual_flag: number) => Promise<IImageItem[]> = (
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
  audit_flag: string;
  _id: string;
}) => Promise<boolean> = (params) =>
  axios<TDbWrite>({
    url: DEV ? _commonData : '/1393/10aa1bc9e4.json',
    params,
  }).then(({ data: [{ affected_rows }] }) => affected_rows > 0);
