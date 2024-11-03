import httpInstance from "@/utils/http";

export const getDeptListAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "dept/list",
    params,
  });
};
