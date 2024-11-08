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
    return { userInfo, doUserLogin, clearLoginData };
  },
  {
    persist: true,
  }
);
