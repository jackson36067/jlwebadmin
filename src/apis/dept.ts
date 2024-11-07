import httpInstance from "@/utils/http";

export const getDeptListAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "dept/list",
    params,
  });
};

export const getDeptByIdAPI = (id: string) => {
  return httpInstance({
    method: "get",
    url: `dept/${id}`,
  });
};
