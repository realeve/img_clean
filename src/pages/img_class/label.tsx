import {
  Skeleton,
  Radio,
  Row,
  Col,
  Input,
  Button,
  message,
  Switch,
  Modal,
} from 'antd';

import styles from './label.less';

import { DEV } from '@/utils/setting';
import useFetch from '@/component/hooks/useFetch';

import { useState, useEffect, useRef } from 'react';

import { connect } from 'dva';
import { ICommon } from '@/models/common';
import { Dispatch } from 'redux';

import Header from './Head';

const LabelPage = () => {
  const ref = useRef(null);
  return (
    <div className="card-content">
      <Header ref={ref} />
    </div>
  );
};

export default LabelPage;
