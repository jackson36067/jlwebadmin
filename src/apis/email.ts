import httpInstance from "@/utils/http";

export const sendEmailAPI = (data: object) => {
  return httpInstance({
    method: "post",
    url: "email/send",
    data,
  });
};
