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
  let xmlUrl = imageHost + url.replace('.bmp', '.xml');
  let xml = await axios({ url: xmlUrl });
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

  return { x1, y1, x2, y2 };
};
