import httpInstance from "@/utils/http";

/**
 * 根据条件分页获取任务日志
 * @param params
 * @returns
 */
export const getTaskLogListAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "quartz/log/list",
    params,
  });
};

/**
 * 导出任务日志数据
 * @returns
 */
export const exportTaskLogDataAPI = () => {
  return httpInstance({
    method: "get",
    url: "quartz/log/export",
    responseType: "blob",
  });
};
