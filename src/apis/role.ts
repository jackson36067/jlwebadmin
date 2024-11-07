import httpInstance from "@/utils/http";

/**
 * 获取所有角色名称
 */
export const getRoleListAPI = () => {
  return httpInstance({
    method: "get",
    url: "role/all",
  });
};

/**
 * 分页获取角色
 * @param params
 * @returns
 */
export const getRoleWithPagingAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "role/list",
    params,
  });
};

/**
 * 修改角色权限菜单
 * @param data
 * @returns
 */
export const updateRoleMenuAPI = (data: object) => {
  return httpInstance({
    method: "put",
    url: "role/update/menu",
    data,
  });
};

/**
 * 新增角色
 * @param data
 * @returns
 */
export const addRoleAPI = (data: object) => {
  return httpInstance({
    method: "post",
    url: "role/add",
    data,
  });
};

/**
 * 更新角色
 * @param data
 * @returns
 */
export const updateRoleAPI = (data: object) => {
  return httpInstance({
    method: "put",
    url: "role/update",
    data,
  });
};

export const getRoleByIdsAPI = (data: Array<string>) => {
  return httpInstance({
    method: "post",
    url: "role/ids",
    data,
  });
};

/**
 * 导出角色数据
 * @returns
 */
export const exportRoleDataAPI = () => {
  return httpInstance({
    method: "post",
    url: "role/export",
  });
};

export const deleteRoleByIdsAPI = (data: Array<string>) => {
  return httpInstance({
    method: "delete",
    url: "role/delete",
    data,
  });
};
