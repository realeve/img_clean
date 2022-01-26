import * as R from 'ramda';
export interface IFakeItem {
  format_pos: string;
  gz: string;
  kilo: string;
  hundred: string;
  client_no: string;
  desc: string;
  index: number;
  isEmpty: boolean;
  pageNo: number;
  appendLine: number[];
}

const LINES_PER_PAGE = 36;

export const handleData = (e) => {
  let data = R.clone(e.data) as IFakeItem[];
  if (data.length === 0) {
    return e;
  }

  let prevKilo = data[0].kilo;

  let addLines = 7;
  let currentIndex = addLines;
  data = data.map((item, idx) => {
    currentIndex += 1;
    let i = 0;
    // 翻页
    if (item.kilo != prevKilo && idx) {
      currentIndex += 3; // 3行千位头

      // 上一组的索引
      let prevIndex = data[idx - 1].index;
      // 出现跨页
      if (prevIndex % LINES_PER_PAGE >= LINES_PER_PAGE - 4) {
        let needAppend = LINES_PER_PAGE - (prevIndex % LINES_PER_PAGE);
        currentIndex += needAppend;
        data[idx - 1].appendLine = R.range(0, needAppend);
      } else {
        if (prevIndex % LINES_PER_PAGE) {
          currentIndex += 1;
          data[idx - 1].appendLine = R.range(0, 1);
        }
      }

      prevKilo = item.kilo;
    }

    let isCurrentKiloNotEnd =
      idx < data.length - 1 && item.kilo == data[idx + 1].kilo;

    if (isCurrentKiloNotEnd) {
      item.isEmpty = currentIndex % LINES_PER_PAGE == 0;
    }
    item.index = currentIndex;
    if (item.isEmpty) {
      currentIndex += 1;
    }

    item.pageNo = Math.ceil(item.index / LINES_PER_PAGE);
    let descWord = '';

    switch (item.client_no) {
      case '10':
        descWord = '(Z)';
        item.desc = '正面';
        break;
      case '15':
        descWord = '(S)';
        item.desc = '丝印';
        break;
      case '12':
        descWord = '(S)';
        item.desc = '丝印';
        break;
      case '14':
        item.desc = '背面';
        descWord = '(B)';
        break;
      case '16':
        item.desc = '背红';
        descWord = '(B)';
        break;
      case '17':
        item.desc = '背荧';
        descWord = '(B)';
        break;
      case '13':
        item.desc = '透视';
        descWord = '(T)';
        break;
      default:
        item.desc = '';
        descWord = '';
        break;
    }

    item.hundred = item.hundred + descWord;
    return item;
  });

  return {
    ...e,
    data,
  };
};
