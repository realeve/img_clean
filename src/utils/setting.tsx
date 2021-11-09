export const AUTHOR = '成都印钞有限公司 信息技术部、印钞管理部';

/** 当前是否是开发模式 */
export const DEV: boolean = process.env.NODE_ENV === 'test'; // || process.env.NODE_ENV === 'development';

export const host = DEV ? 'http://localhost:90/api/' : 'http://10.8.1.25:100';

export const imageHost = 'http://localhost:98/';
