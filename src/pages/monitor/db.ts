import { axios, IAxiosState, DEV, _commonData, TDbWrite } from '@/utils/axios';

export interface ICartItem {
  id: string;
  cart: string;
  check_date: string;
  leak_normal_img: string;
  normal_img: string;
  err_fake_img: string;
  fake_img: string;
  total_img: string;
  acc: number;
  idx: number | '';
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
    url: '/1429/723ecb6c39.json',
    params: {
      cart_id,
      blob: 'image',
      blob_type: 'jpg',
    },
  }).then(handleImageResult);

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
export const getImagesNeedJudge = (ip: string) =>
  axios<IImageItem>({
    url: DEV ? '@/mock/1432_b7e5eb2fe4.json' : '/1432/b7e5eb2fe4.json',
    params: {
      ip,
      blob: 'image',
      blob_type: 'jpg',
    },
  }).then((res) => {
    res.data = res.data.sort(
      (a: IImageItem, b: IImageItem) => a.probability - b.probability,
    );
    res.data = res.data.sort((a, b) => a.ai_result - b.ai_result);
    return handleImageResult(res);
  });

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
export const getImageCount = () =>
  axios<{ ai_leak: string; human_leak: string }>({
    url: DEV ? '@/mock/1434_07d35b6b5a.json' : '/1434/07d35b6b5a.json',
  }).then((res) => res.data[0]);
