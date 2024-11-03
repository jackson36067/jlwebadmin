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
