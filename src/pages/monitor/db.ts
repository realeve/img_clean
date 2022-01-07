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
}
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
  }).then((res) =>
    res.data.map((item) => ({
      ...item,
      probability: Number(Number(item.probability * 100).toFixed(1)),
    })),
  );
