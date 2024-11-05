import httpInstance from "@/utils/http";

export const getMenuListAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "menu/list",
    params,
  });
};
