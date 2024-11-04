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
