import { axios, IAxiosState, DEV, _commonData, TDbWrite } from '@/utils/axios';
import * as R from 'ramda';

const admin1 = '10.8.60.203';

export interface ICartItem {
  id: string;
  cart: string;
  check_date: string;
  leak_normal_img: string;
  leak_normal_fake_img: string;
  leak_normal_normal_img: string;
  normal_img: string;
  err_fake_img: string;
  err_fake_fake_img: string;
  err_fake_normal_img: string;
  fake_img: string;
  total_img: string;
  acc: number;
  acc_fix: number;
  idx: number | '';
  head: string;
  judge_date: string;
  judge_result: string;
}
/**
 *   @database: { 图像核查判废数据记录 }
 *   @desc:     { AI判废车号列表 }
 */
export const getCarts = (params: { tstart: string; tend: string }) =>
  axios<ICartItem>({
    url: DEV ? '@/mock/1430_d55a6e3d81.json' : '/1430/d55a6e3d81.json',
    params,
  }).then((res) =>
    res.data.map((item, i) => ({
      ...item,
      idx: i || '',
      acc: Number(item.acc),
    })),
  );

export interface IImageItem {
  id: string;
  image: string;
  probability: number;
  human_result: number;
  ai_result: number;
  img_order: number;
  verify_result: string | null;
  ex_codenum: string;
  format_pos: string;
}

export interface IAnalyImageItem extends IImageItem {
  kilo: string;
  cart_id: string;
  verify_result: number;
  verify_result2: number;
}

const handleImageResult = (res) =>
  res.data.map((item, idx) => ({
    ...item,
    img_order: idx + 1,
    probability: Number(Number(item.probability * 100).toFixed(1)),
  }));

/**
 *   @database: { 图像核查判废数据记录 }
 *   @desc:     { 判废结果查询 }
 */
export const getDetail = (cart_id: string) =>
  axios<IImageItem>({
    url: DEV ? '@/mock/1429_723ecb6c39.json' : '/1429/723ecb6c39.json',
    params: {
      cart_id,
      blob: 'image',
      blob_type: 'jpg',
    },
  }).then(handleImageResult);

/**
 *   @database: { 图像核查判废数据记录 }
 *   @desc:     { 图像核查实废审核数据查询 }
 */
export const getBanknoteDetail = (cart: string) =>
  axios<IImageItem>({
    url: DEV ? '@/mock/1450_42dad0ac9b.json' : '/1450/42dad0ac9b.json',
    params: {
      cart,
      blob: 'image',
      blob_type: 'jpg',
    },
  }).then((res) => {
    let data = handleImageResult(res) as IAnalyImageItem[];
    data = data.map((item) => {
      item.kilo = item.ex_codenum.substring(6, 7);
      return item;
    });

    return R.groupBy(R.prop('kilo'), data);
  });

/**
 *   @database: { 图像核查判废数据记录 }
 *   @desc:     { 最近判废日期 }
 */
export const getCartsDateRange = () =>
  axios<{
    tstart: string;
    tend: string;
  }>({
    url: DEV ? '@/mock/1431_d913255582.json' : '/1431/d913255582.json',
  }).then((res) => res.data[0]);

export interface IJudgeImageItem {
  probability: number;
  image: string;
  id: string;
  ai_result: number;
  img_order: number;
}
/**
 *   @database: { 图像核查判废数据记录 }
 *   @desc:     { 领用一组判废图片 }
 */
export const getImagesNeedJudge = (ip: string, cart: string | undefined) => {
  let url = '/1432/b7e5eb2fe4.json'; //  '/1436/b7e5eb2fe4.json';

  if (cart) {
    url = '1448/a0808c7e99';
  }
  return axios<IImageItem>({
    url: DEV ? '@/mock/1432_b7e5eb2fe4.json' : url,
    params: {
      ip,
      blob: 'image',
      blob_type: 'jpg',
      cart,
    },
  }).then((res) => {
    res.data = res.data.sort(
      (a: IImageItem, b: IImageItem) => a.probability - b.probability,
    );
    res.data = res.data.sort((a, b) => a.ai_result - b.ai_result);
    return handleImageResult(res);
  });
};

/**
 *   @database: { 图像核查判废数据记录 }
 *   @desc:     { 更新一组图片状态为临时判废 }
 */
export const judgeImages: (params: {
  ip: string;
  _id: string[];
  verify_result: number;
}) => Promise<boolean> = (params) =>
  params._id.length > 0
    ? axios<TDbWrite>({
        url: DEV ? _commonData : '/1433/3bb138de33.json',
        params,
      }).then(({ data: [{ affected_rows }] }) => affected_rows > 0)
    : Promise.resolve(true);

/**
 *   @database: { 图像核查判废数据记录 }
 *   @desc:     { 更新一组图片状态为临时判废 }
 */
export const analysisImageJudge: (params: {
  ip: string;
  _id: string[];
  verify_result: number;
}) => Promise<boolean> = (params) =>
  params._id.length > 0
    ? axios<TDbWrite>({
        url: DEV ? _commonData : '1437/3bb138de33.json',
        params,
      }).then(({ data: [{ affected_rows }] }) => affected_rows > 0)
    : Promise.resolve(true);

/**
 * 领用一组图片
 * @returns 判定结果
 */
export const receiveImageJudgeTask: (params: {
  ip: string;
  _id: string[];
}) => Promise<boolean> = (params) =>
  judgeImages({ ...params, verify_result: -1 });

/**
 *   @database: { 图像核查判废数据记录 }
 *   @desc:     { 待判废数量 }
 */
export const getImageCount = (ip: string, cart: string | undefined) => {
  let url = '/1434/07d35b6b5a.json'; //  ip == admin1 ?  : '/1438/07d35b6b5a.json';

  if (cart) {
    url = '/1446/483314b6e8';
  }

  return axios<{ ai_leak: string; human_leak: string }>({
    url: DEV ? '@/mock/1434_07d35b6b5a.json' : url,
    params: { cart },
  }).then((res) => res.data[0]);
};

/**
 *   @database: { 图像核查判废数据记录 }
 *   @desc:     { 判废结果汇总 }
 */
export const getJudgeResult = (ip: string, cart: string | undefined) => {
  let url = '/1435/cb72af5f40.json'; // ip == admin1 ? '/1435/cb72af5f40.json' : '/1439/cb72af5f40.json';

  if (cart) {
    url = '/1447/28b333c216';
  }
  return axios<{ total: string; human: string; ai: string }>({
    url: DEV ? '@/mock/1435_cb72af5f40.json' : url,
    params: { cart },
  }).then((res) => res.data[0]);
};

/**
 *   @database: { 图像核查判废数据记录 }
 *   @desc:     { AI判废补充剔废单 }
 */
export const getJudgeDetail: (cart: string) => Promise<IAxiosState> = (cart) =>
  axios({
    url: DEV ? '@/mock/1444_4c99b981d8.json' : '/1444/4c99b981d8.json',
    params: {
      cart,
    },
  });

/**
 *   @database: { 图像核查判废数据记录 }
 *   @desc:     { 更新判废状态 }
 */
export const updateCarts = (cart: string) =>
  axios<{ affected_rows: number }>({
    url: DEV ? _commonData : '/1449/91798a1be1.json',
    params: {
      cart,
    },
  }).then((res) => res.data[0].affected_rows > 0);
