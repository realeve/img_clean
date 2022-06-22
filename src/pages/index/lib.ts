import { Parser } from 'xml2js';

import { imageHost } from '@/utils/setting';

const parser = new Parser();

import { axios } from '@/utils/axios';

export const decodeXML = (xml: string) => parser.parseStringPromise(xml);

export interface IBoxItem {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export const fetchXML = async (url: string) => {
  let xmlUrl =
    (url.includes('http') ? '' : imageHost) + url.replace('.bmp', '.xml');
  let xml = await axios({ url: xmlUrl }).catch((e) => {
    return false;
  });
  if (!xml) {
    return { x1: 0, y1: 0, x2: 112, y2: 112 };
  }
  let result = await decodeXML(xml);
  if (!result) {
    return null;
  }

  const obj = result.annotation.object[0];
  const box = obj?.bndbox?.[0];

  if (!box) {
    return null;
  }
  let x1 = Number(box.xmin[0]),
    y1 = Number(box.ymin[0]),
    x2 = Number(box.xmax[0]),
    y2 = Number(box.ymax[0]);

  // 20211116 背面缺陷框位置需要做坐标系转换  || url.includes('image/15')
  if (url.includes('image/14')) {
    let temp = x2;
    x2 = 112 - x1;
    x1 = 112 - temp;
    temp = y2;
    y2 = 112 - y1;
    y1 = 112 - temp;
  }
  return { x1, y1, x2, y2 };
};

const key = 'img_judge_';
export const saveImageSize = (imgsize: number) => {
  window.localStorage.setItem(key + 'imgsize', String(imgsize));
};

export const getImageSize = (defaultImageSize = 192) => {
  let res = window.localStorage.getItem(key + 'imgsize') || defaultImageSize;
  return Number(res);
};

export const getShowModel = () => {
  let res = window.localStorage.getItem(key + 'showModel') || '0';
  return Boolean(Number(res));
};

export const saveShowModel = (showModel = false) => {
  window.localStorage.setItem(key + 'showModel', showModel ? '1' : '0');
};

export const saveJudgeType = (judgetype: string) => {
  window.localStorage.setItem(key + 'judgetype', String(judgetype));
};

export const getJudgeType = () =>
  (window.localStorage.getItem(key + 'judgetype') || '0') as '0' | '1';
