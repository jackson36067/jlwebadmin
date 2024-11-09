import httpInstance from "@/utils/http";

/**
 * 获取菜单集合
 * @param params
 * @returns
 */
export const getMenuListAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "menu/list",
    params,
  });
};

/**
 * 新增菜单
 * @param data
 * @returns
 */
export const addMenuAPI = (data: object) => {
  return httpInstance({
    method: "post",
    url: "menu/add",
    data,
  });
};

/**
 * 编辑菜单
 * @param data
 * @returns
 */
export const updateMenuAPI = (data: object) => {
  return httpInstance({
    method: "put",
    url: "menu/update",
    data,
  });
};

/**
 * 根据ids批量删除菜单
 * @param data
 * @returns
 */
export const deleteMenuAPI = (data: Array<string>) => {
  return httpInstance({
    method: "delete",
    url: "menu/delete",
    data,
  });
};

/**
 * 导出菜单数据
 */
export const exportMenuDataAPI = () => {
  return httpInstance({
    method: "get",
    url: "menu/export",
    responseType: "blob",
  });
};
