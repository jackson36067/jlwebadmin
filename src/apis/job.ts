import httpInstance from "@/utils/http";

export const getEnabledJobListAPI = () => {
  return httpInstance({
    method: "get",
    url: "job/enabled/list",
  });
};
