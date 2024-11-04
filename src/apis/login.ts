import httpInstance from "@/utils/http";
// export const getCodeImgAPI = () => {
//   return httpInstance({
//     url: "/auth/code",
//     method: "get",
//   });
// };
export const LoginAPI = (data: object) => {
  return httpInstance({
    url: "user/login",
    method: "post",
    data,
  });
};

/**
 * 获取验证码接口
 * @returns
 */
export const getCodeAPI = () => {
  return httpInstance({
    method: "get",
    url: "user/code",
    responseType: "blob", // 设置响应类型为 blob
  });
};
