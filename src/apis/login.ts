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
