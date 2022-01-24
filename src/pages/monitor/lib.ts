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
  let prevKilo = '0';
  let addLines = 7;
  let currentIndex = addLines;

  data = data.map((item, idx) => {
    currentIndex += 1;

    let isCurrentKiloNotEnd =
      idx < data.length - 1 && item.kilo == data[idx + 1].kilo;
    // 翻页
    if (item.kilo != prevKilo) {
      currentIndex += 3; // 3行千位头

      // 上一组的索引
      let prevIndex = data[idx - 1].index;
      // 出现跨页
      if (prevIndex % LINES_PER_PAGE >= LINES_PER_PAGE - 4) {
        let needAppend = LINES_PER_PAGE - (prevIndex % LINES_PER_PAGE);
        currentIndex += needAppend;
        data[idx - 1].appendLine = R.range(0, needAppend);
      } else {
        if (isCurrentKiloNotEnd) {
          currentIndex += 1;
          data[idx - 1].appendLine = R.range(0, 1);
        }
      }

      prevKilo = item.kilo;
    }

    if (isCurrentKiloNotEnd) {
      item.isEmpty = currentIndex % LINES_PER_PAGE == 0;
    }
    item.index = currentIndex;
    if (item.isEmpty) {
      currentIndex += 1;
    }

    switch (item.client_no) {
      case '10':
        item.desc = 'Z';
        break;
      case '15':
        item.desc = 'S';
        break;
      case '14':
      case '16':
      case '17':
        item.desc = 'B';
        break;
      default:
        item.desc = '';
        break;
    }

    return item;
  });
  return {
    ...e,
    data,
  };
};
