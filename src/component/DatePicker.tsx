import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { DatePicker } from 'antd';
import * as R from 'ramda';

import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

export const dateRanges = {
  去年: [
    moment().subtract(1, 'year').startOf('year'),
    moment().subtract(1, 'year').endOf('year'),
  ],
  今年: [moment().startOf('year'), moment()],
  上半年: [
    moment().quarter(1).startOf('quarters'),
    moment().quarter(2).endOf('quarters'),
  ],
  下半年: [
    moment().quarter(3).startOf('quarters'),
    moment().quarter(4).endOf('quarters'),
  ],
  上季度: [
    moment().subtract(1, 'quarter').startOf('quarter'),
    moment().subtract(1, 'quarter').endOf('quarter'),
  ],
  本季度: [moment().startOf('quarter'), moment()],
  去年同期: [
    moment().subtract(1, 'year').startOf('month'),
    moment().subtract(1, 'year'),
    // .endOf('month'),
  ],
  过去一月: [moment().subtract(1, 'month'), moment()],
  上月: [
    moment().subtract(1, 'month').startOf('month'),
    moment().subtract(1, 'month').endOf('month'),
  ],
  本月: [moment().startOf('month'), moment()],
  '7天前': [moment().subtract(1, 'week'), moment()],
  上周: [
    moment().subtract(1, 'week').startOf('week'),
    moment().subtract(1, 'week').endOf('week'),
  ],
  本周: [moment().startOf('week'), moment()],
  昨天: [
    moment().subtract(moment().format('E') == 1 ? 3 : 1, 'days'),
    moment().subtract(moment().format('E') == 1 ? 3 : 1, 'days'),
  ],
  今天: [moment(), moment()],
  前天: [moment().subtract(2, 'days'), moment().subtract(2, 'days')],
  三天前: [moment().subtract(3, 'days'), moment().subtract(3, 'days')],
  过去一年: [moment().subtract(1, 'year'), moment()],
  日历月: [moment().startOf('month'), moment().endOf('month')],
};

const getRanges = (dateFormat: string) => {
  let range = {};
  Object.keys(dateRanges).map((key) => {
    range[key] = dateRanges[key].map((item) =>
      moment(moment(item, dateFormat).format(dateFormat)),
    );
  });
  return range;
};

const { RangePicker } = DatePicker;
const getDefaultDateStr: (string) => [string, string] = (dateFormat) => {
  let defaultVal = dateRanges['昨天'];
  let tstart = moment(defaultVal[0]).format(dateFormat);
  let tend = moment(defaultVal[1]).format(dateFormat);
  return [tstart, tend];
};

const getDerivedState = (value: string[], dateFormat: string) => {
  let tstart, tend;
  if (R.isNil(value) || value.length == 0) {
    let res = getDefaultDateStr(dateFormat);
    tstart = res[0];
    tend = res[1];
  } else if (value.length == 1) {
    tstart = value[0];
    tend = value[0];
  } else {
    tstart = value[0];
    tend = value[1];
  }
  return [moment(tstart).format(dateFormat), moment(tend).format(dateFormat)];
};

function DatePick({
  value,
  onChange,
  dateType: _dateType,
  dateFormat,
  dispatch,
  ...props
}: {
  value?: string[];
  [key: string]: any;
}) {
  const [strDate, setStrDate] = useState(getDerivedState(value, dateFormat));
  useEffect(() => {
    setStrDate(getDerivedState(value, dateFormat));
  }, [value]);

  const onRangeChange = (_, date) => {
    setStrDate(date);
  };

  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open || strDate.length === 0) {
      return;
    }
    onChange(strDate);
  }, [open, strDate.join('')]);

  return (
    <div {...props}>
      <label style={{ paddingRight: 10 }}>
        {_dateType?.[0]?.includes('single') ? '查询日期' : '起始日期'}:
      </label>
      {_dateType?.[0]?.includes('single') ? (
        <DatePicker
          format={dateFormat}
          defaultValue={moment(strDate[0], dateFormat)}
          value={moment(strDate[0], dateFormat)}
          mode={_dateType[0].replace('single', '')}
          onOpenChange={setOpen}
          onChange={(e) => {
            setStrDate([e, e]);
          }}
          style={{ width: 110 }}
          size="small"
          allowClear={false}
        />
      ) : (
        <RangePicker
          ranges={getRanges(dateFormat)}
          format={dateFormat}
          defaultValue={[
            moment(strDate[0], dateFormat),
            moment(strDate[1], dateFormat),
          ]}
          value={[
            moment(strDate[0], dateFormat),
            moment(strDate[1], dateFormat),
          ]}
          mode={_dateType}
          onOpenChange={setOpen}
          onChange={onRangeChange}
          style={{ width: 220 }}
          size="small"
          allowClear={false}
          locale={{
            rangePlaceholder: ['开始日期', '结束日期'],
          }}
        />
      )}
    </div>
  );
}

export default connect(({ common }) => ({
  dateType: common.dateType,
  dateFormat: common.dateFormat,
}))(DatePick);
