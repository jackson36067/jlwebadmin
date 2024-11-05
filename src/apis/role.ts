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

export const getRoleWithPagingAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "role/list",
    params,
  });
};

export const updateRoleMenuAPI = (data: object) => {
  return httpInstance({
    method: "put",
    url: "role/update/menu",
    data,
  });
};
