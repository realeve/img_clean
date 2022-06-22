/**
 * 
 * @param a 第一个数
 * @param b 第二个数
 * @returns 和
 */
const add = (a: number, b: number) => {
    return a + b;
}


// 根据用户名长度判断是否可以注册
const checkUserName = (username: string) => {
    if (username.length < 4) {
        return false;
    }
    return true;
}

// 判断是否是身份证号
const checkIdCard = (idCard: string) => {
    let reg = /
}