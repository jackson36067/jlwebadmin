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

export const exportLogDataAPI = () => {
  return httpInstance({
    method: "get",
    url: "log/export",
    responseType: "blob",
  });
};
