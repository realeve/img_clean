import moment from 'dayjs';
import { DEV } from './setting';
import * as axios from './axios';
import * as R from 'ramda';

export const getType = axios.getType;

/**
 * cart:车号
 * reel:轴号
 * reel_cart:纸张上下5千车号
 * reel_patch:纸张批次号
 * pallet:纸张拍号
 * plate:印版
 */
interface Rules {
  cart: RegExp;
  reel: RegExp;
  reel_cart: RegExp;
  reel_patch: RegExp;
  pallet: RegExp;
  plate: RegExp;
  phone: RegExp;
  url: RegExp;
  [key: string]: RegExp;
}
export const rules: Rules = {
  cart: /^[0-9]\d{3}[A-Za-z]\d{3}(|[a-bA-B])$|^BP\d{2}[A-Z]\d{3}$/, // 车号
  // reel: /^[1-9]\d{6}(|[A-Ca-c])$|[A-Z]\d{11}[A-Z]/, //^[1-9]\d{4}[A-Ca-c]$|
  reel: /^[0-9]\d{6}([A-Ca-c]|)$|[A-Z]\d{11}([A-Z]|)|^\d{3}[A-Z]\d{5}(|[A-Z])$/, // 轴号 //^[1-9]\d{4}[A-Ca-c]$|
  reel_cart: /^[0-9]\d{3}[A-Za-z]\d{3}([A-B]|[a-b])$/,
  reel_patch: /^\d{5}([A-Z|a-z])\d$/, //2020 6T 2
  pallet: /^\d{2}(0[1-9]|1[0-2])\d{2}(1|2)\d{6}$/,
  plate: /^[A-Z|a-z]{2}\d{6}$|^[A-Z|a-z]{2}\d{8}$|^\d{8}$|^\d{6}$/,
  phone: /^\d{8}$|^\d{11}$/,
  url: /^http(s|):\/\//,
};

interface CartReelReg {
  (str: string | number): boolean;
}

export const isCartOrReel: CartReelReg = (str) => {
  return (
    rules.cart.test(String(str).trim()) || rules.reel.test(String(str).trim())
  );
};

/**
 * 判断是否为车号
 * @param str 车号
 * @returns 是/否
 */
export const isCart: CartReelReg = (str) => rules.cart.test(String(str).trim());

/**
 * 判断是否为轴号
 * @param str 轴号
 * @returns 是/否
 */
export const isReel: CartReelReg = (str) => rules.reel.test(String(str).trim());
export const isPlate: CartReelReg = (str) =>
  rules.plate.test(String(str).trim());

export const isUrl = (str) => rules.url.test(String(str).trim());

// 车号/冠号/轴号的起始2位
export const mayBeCartOrReel: CartReelReg = (str) => {
  let _str = String(str).trim();
  return _str.length === 1
    ? /\d/.test(_str)
    : /^(\d{2}|[A-Z]\d)$/.test(_str.slice(0, 2));
};

export const isDateTime: CartReelReg = (str) =>
  /^\d{4}(-|\/|)[0-1]\d(-|\/|)[0-3]\d$|^\d{4}(-|\/|)[0-1]\d(-|\/|)[0-3]\d [0-2][0-9]:[0-5][0-9](|:[0-5][0-9])$|^[0-2][0-9]:[0-5][0-9](|:[0-5][0-9])$/.test(
    String(str).trim(),
  );

export const isDate: CartReelReg = (str) =>
  /^\d{4}(-|\/|)[0-1]\d(-|\/|)[0-3]\d$|^\d{4}(-|\/|)[0-1]\d(-|\/|)[0-3]\d$/.test(
    String(str).trim(),
  );
export const isTime: CartReelReg = (str) =>
  /^\d{4}(-|\/|)[0-1]\d(-|\/|)[0-3]\d [0-2][0-9]:[0-5][0-9](:[0-5][0-9])|^[0-2][0-9]:[0-5][0-9](:[0-5][0-9])(|.\d)/.test(
    String(str).trim(),
  );

export const isMonth: CartReelReg = (str) =>
  /^[1-9]\d{3}(|\-|\/)[0-1]\d$/.test(String(str).trim());

// 数字
export const isNumOrFloat: CartReelReg = (str) =>
  /^(-|\+|)\d+\.\d+$|^(-|\+|)[1-9]\d+$/.test(String(str));

// 整数
export const isInt: CartReelReg = (str) =>
  /^(-|\+|)?[0-9]\d*$/.test(String(str));

// 浮点
export const isFloat: CartReelReg = (str) =>
  !isCart(str) &&
  (isNumOrFloat(str) ||
    /^(-|\+|)\d+\.\d+(|e|E)(|\-|\+)\d+$|^(-|\+|)\d+(|e|E)(|\-|\+)\d+$/.test(
      String(str),
    ));

export const hasDecimal: CartReelReg = (str) =>
  /^(-|\+|)\d+\.\d+$/.test(String(str));
export const parseNumber: {
  (str: number): number | string;
} = (str) => {
  if (!hasDecimal(str)) {
    return str;
  }
  return typeof str === 'string' ? parseFloat(str).toFixed(3) : str.toFixed(3);
};

export const now = () => moment().format('YYYY-MM-DD HH:mm:ss');

export const today = () => moment().format('YYYY-MM-DD');
export const ymd = () => moment().format('YYYYMMDD');

export const timestamp = () => moment().format('x');

interface Store {
  payload: any;
}
export const setStore = (state, store: Store) => {
  let { payload } = store;
  if (typeof payload === 'undefined') {
    payload = store;
    // throw new Error('需要更新的数据请设置在payload中');
  }
  let nextState = R.clone(state);
  Object.keys(payload).forEach((key) => {
    let val = payload[key];
    if (getType(val) == 'object') {
      nextState[key] = Object.assign({}, nextState[key], val);
    } else {
      nextState[key] = val;
    }
  });
  return nextState;
};

/**
 * https://github.com/reduxjs/redux/blob/6b3e1ceb1ddef4915b9b8e148be66c0806f9fd0a/src/utils/actionTypes.ts#L8
 */
export const getNonce = () => Math.random().toString(36).slice(3);

const saveVersion = (version) => {
  window.localStorage.setItem('version', version);
};

/**
 * 处理当前系统版本号
 * @param param0 系统版本号、更新日期
 */
const readVersion = async ({ version, date }) => {
  let localVersion = Number(window.localStorage.getItem('version') || '0.0');
  let serverVersion = Number(version);

  // 版本未更新，退出
  if (serverVersion <= localVersion) {
    return;
  }

  // 否则存储新版本信息;
  saveVersion(version);
};

/**
 * 获取系统版本号
 */
export const getVersion = () =>
  axios
    .axios({
      url: `${window.location.origin}/version${DEV ? 'dev' : ''}.json`,
    })
    .then((res) => {
      readVersion(res);
      return res;
    });

export const encodeBase64 = (str: string) =>
  window.btoa(unescape(encodeURIComponent(str)));

export const decodeBase64 = (str: string) =>
  decodeURIComponent(escape(window.atob(str)));

export let getDataByIdx: ({ key: string, data: any }) => Array<any> = ({
  key,
  data,
}) => R.pluck(key)(data);

export let getUniqByIdx: ({ key: string, data: any }) => Array<any> = ({
  key,
  data,
}) =>
  R.uniq(
    getDataByIdx({
      key,
      data,
    }),
  );

export const isChineseWord = (str) => new RegExp(/[\u00A1-\uFFFF]/).test(str);

// 中文宽1，其余宽0.7
export const getStringWidth = (str) => {
  if (isFloat(str)) {
    str = Number(str).toFixed(2);
  }
  return String(str)
    .trim()
    .split('')
    .reduce((x, y) => x + (isChineseWord(y) ? 1 : 0.7), 0);
};

export const getTableExtraLabel = ({ header, data }) => {
  if (R.isNil(data) || data.length === 0) {
    return [];
  }
  return header.map((item, idx) => `${item}:${data[0][idx]}`);
};

// 将带,;及换行符的字符串转换为数组文本
export const str2Arr: (str: string, needTrim?: boolean) => string[] = (
  str,
  needTrim = true,
) => {
  if (!str) {
    return [];
  }
  str = String(str).trim();
  let res = [];
  if (str.includes(',')) {
    res = str.split(',');
  } else if (str.includes(';')) {
    res = str.split(';');
  } else if (str.includes(' ')) {
    res = str.split(' ');
  } else if (str.includes('\n')) {
    res = str.split('\n');
  } else {
    res = [str];
  }
  res = res.map((item) => item.replace(/\n/, ''));
  if (needTrim) {
    res = R.filter((item) => item.trim().length > 0)(res);
  }
  return res;
};

/**
 *
 * @param {file文件对象，input type="file"} file
 * @param type 'buffer' | 'binary'
 * @desc 将file图像文件对象转换为BASE64
 */
export let loadDataFile: (
  file: File,
  type?: 'binary' | 'buffer',
) => Promise<null | Blob> = async (file, type = 'buffer') => {
  if (typeof FileReader === 'undefined') {
    return Promise.resolve(null);
  }

  let reader: FileReader = new FileReader();
  reader[type === 'buffer' ? 'readAsArrayBuffer' : 'readAsBinaryString'](file);

  return new Promise((resolve) => {
    reader.onload = ({ target: { result } }: { target: { result: Blob } }) => {
      resolve(result);
    };
  });
};
