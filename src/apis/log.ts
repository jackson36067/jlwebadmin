import httpInstance from "@/utils/http";

/**
 * 获取操作日志
 * @param params
 * @returns
 */
export const getLogListAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "log/list",
    params,
  });
};

/**
 * 导出日志数据
 * @returns
 */
export const exportLogDataAPI = (isError: boolean) => {
  return httpInstance({
    method: "get",
    url: "log/export",
    responseType: "blob",
    params: {
      isError,
    },
  });
};
