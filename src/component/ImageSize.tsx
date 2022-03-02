import { saveImageSize } from '@/pages/index/lib';

import { connect } from 'dva';
import { ICommon } from '@/models/common';
import { Dispatch } from 'redux';
import { Radio, Col } from 'antd';

export const imgSize = [112, 128, 192, 224, 256, 384];
export const defaultImageSize = 192;

export const ImageSizeComponent = ({
  imgHeight,
  dispatch,
}: {
  imgHeight: number;
  dispatch: Dispatch;
}) => {
  const updateImgHeight = (imgHeight: number) => {
    dispatch({
      type: 'common/setStore',
      payload: {
        imgHeight,
      },
    });
    saveImageSize(imgHeight);
  };
  return (
    <Col span={12} style={{ marginTop: 10 }}>
      图片默认大小(像素)：
      <Radio.Group
        defaultValue={defaultImageSize}
        value={imgHeight}
        buttonStyle="solid"
        onChange={(e) => {
          updateImgHeight(e.target.value);
        }}
      >
        {imgSize.map((item) => {
          return (
            <Radio.Button value={item} key={String(item)}>
              {item}
            </Radio.Button>
          );
        })}
      </Radio.Group>
    </Col>
  );
};

export default connect(({ common }: { common: ICommon }) => ({
  imgHeight: common.imgHeight,
}))(ImageSizeComponent);
