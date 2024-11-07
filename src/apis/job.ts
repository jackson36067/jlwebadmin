import httpInstance from "@/utils/http";

export const getEnabledJobListAPI = () => {
  return httpInstance({
    method: "get",
    url: "job/enabled/list",
  });
};

export const getJobByIdsAPI = (data: Array<string>) => {
  return httpInstance({
    method: "post",
    url: "job/ids",
    data,
  });
};
