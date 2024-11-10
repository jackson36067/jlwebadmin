import httpInstance from "@/utils/http";

/**
 * 获取部门列表
 * @param params
 * @returns
 */
export const getDeptListAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "dept/list",
    params,
  });
};

/**
 * 根据id获取部门
 * @param id
 * @returns
 */
export const getDeptByIdAPI = (id: string) => {
  return httpInstance({
    method: "get",
    url: `dept/${id}`,
  });
};

/**
 * 新增部门
 * @param data
 * @returns
 */
export const addDeptAPI = (data: object) => {
  return httpInstance({
    method: "post",
    url: "dept/add",
    data,
  });
};

/**
 * 编辑部门
 * @param data
 * @returns
 */
export const updateDeptAPI = (data: object) => {
  return httpInstance({
    method: "put",
    url: "dept/update",
    data,
  });
};

/**
 * 批量删除部门
 * @param data
 * @returns
 */
export const deleteDeptByIdsAPI = (data: Array<string>) => {
  return httpInstance({
    method: "delete",
    url: "dept/delete",
    data,
  });
};

/**
 * 导出部门数据
 * @returns
 */
export const exportDeptDataAPI = () => {
  return httpInstance({
    method: "get",
    url: "dept/export",
    responseType: "blob",
  });
};
