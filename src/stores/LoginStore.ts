import { defineStore } from "pinia";
import { LoginAPI } from "@/apis/login";
import { ref } from "vue";
interface loginParams {
  username: string;
  password: string;
  code: string;
}
export const useLoginStore = defineStore(
  "user",
  () => {
    const userInfo = ref({});
    const doUserLogin = async ({ username, password, code }: loginParams) => {
      const res = await LoginAPI({ username, password, code });
      console.log(res);
      userInfo.value = res.data;
    };
    const clearLoginData = () => {
      userInfo.value = {};
    };
    const updateUserInfo = (params: object) => {
      userInfo.value.nickName = params.nickName;
      userInfo.value.phone = params.phone;
      userInfo.value.gender = params.gender;
    };
    const updateUserEmail = (email: string) => {
      userInfo.value.email = email;
    };
    const updateUserAvatarPath = (avatar: string) => {
      userInfo.value.avatarPath = avatar;
    };
    return {
      userInfo,
      doUserLogin,
      clearLoginData,
      updateUserInfo,
      updateUserEmail,
      updateUserAvatarPath,
    };
  },
  {
    persist: true,
  }
);
