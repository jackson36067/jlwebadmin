import httpInstance from "@/utils/http";

/**
 * 分页获取用户信息
 * @param params
 * @returns
 */
export const getUserListAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "user/list",
    params,
  });
};

/**
 * 获取部门以及其子部门下的所有用户
 * @param value
 * @returns
 */
export const getUserListByDeptAPI = (value: number) => {
  return httpInstance({
    method: "get",
    url: "user/dept",
    params: {
      deptId: value,
    },
  });
};

/**
 * 更新用户
 * @param id 需要更新的用户的id
 * @param params 更新的用户的信息
 * @returns
 */
export const updateUserByUserIdAPI = (id: string, data: object) => {
  return httpInstance({
    method: "put",
    url: `user/update/${id}`,
    data,
  });
};

/**
 * 新增用户
 * @param data
 * @returns
 */
export const addUserAPI = (data: object) => {
  return httpInstance({
    method: "post",
    url: "user/save",
    data,
  });
};

/**
 * 根据用户id获取用户信息
 * @param id
 * @returns
 */
export const getUserInfoByIdAPI = (id: string) => {
  return httpInstance({
    method: "get",
    url: `user/${id}`,
  });
};

/**
 * 根据id删除用户,支持多删
 */
export const deleteUserByUserIdAPI = (ids: Array<string>) => {
  return httpInstance({
    method: "delete",
    url: `user/delete`,
    data: ids,
  });
};

/**
 * 导出用户数据
 * @returns
 */
export const exportUserInfoAPI = () => {
  return httpInstance({
    method: "post",
    url: "user/export",
    responseType: "blob", // 设置响应类型为 blob
  });
};

/**
 * 退出登录
 * @returns
 */
export const logoutAPI = () => {
  return httpInstance({
    method: "post",
    url: "user/logout",
  });
};

/**
 * 获取在线用户列表
 * @param params
 * @returns
 */
export const getOnlineUserAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "user/online",
    params,
  });
};

/**
 * 强制退出用户账号功能
 * @param data 用户名数组
 * @returns
 */
export const forceWithdrawUserAPI = (data: Array<string>) => {
  return httpInstance({
    method: "post",
    url: "user/force",
    data,
  });
};

/**
 * 导出在线用户数据
 * @returns
 */
export const exportOnlineUserInfoAPI = () => {
  return httpInstance({
    method: "get",
    url: "user/online/export",
    responseType: "blob",
  });
};

/**
 * 获取当前用户的操作日志
 * @param params
 * @returns
 */
export const getUserLogAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "user/center/log",
    params,
  });
};

/**
 * 发送验证码给当前邮箱
 * @param email
 * @returns
 */
export const sendVerifyCodeAPI = (email: string) => {
  return httpInstance({
    method: "get",
    url: "user/email/code",
    params: {
      email,
    },
  });
};

/**
 * 修改用户邮箱
 * @param data
 * @returns
 */
export const updateEmailAPI = (data: object) => {
  return httpInstance({
    method: "put",
    url: "user/update/email",
    data,
  });
};

/**
 * 修改用户密码
 * @param data
 * @returns
 */
export const updatePasswordAPI = (data: object) => {
  return httpInstance({
    method: "put",
    url: "user/update/password",
    data,
  });
};

/**
 * 获取好友列表
 * @param username
 * @returns
 */
export const getUserFriendListAPI = (username: string) => {
  return httpInstance({
    method: "get",
    url: "user/friend/list",
    params: {
      username,
    },
  });
};

/**
 * 获取两个用户的聊天记录
 * @param params
 * @returns
 */
export const getUsersMessageAPI = (
  username: string,
  friendUsername: string
) => {
  return httpInstance({
    method: "get",
    url: "user/message",
    params: { username, friendUsername },
  });
};
