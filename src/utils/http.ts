import axios from "axios";
import { useLoginStore } from "@/stores/LoginStore";
import router from "@/router";
import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/el-message.css";
import { ref } from "vue";
const httpInstance = axios.create({
  baseURL: "http://localhost:8080/admin/",
  timeout: 5000,
});
// 验证码
const captcha = ref("");
httpInstance.interceptors.request.use(
  (config) => {
    // 发起请求时携带验证码
    console.log("当前验证码:", captcha.value);
    if (config.headers.code == null) {
      config.headers.Code = captcha.value;
    }
    const loginStore = useLoginStore();
    // @ts-ignore
    const token: string = loginStore.userInfo.token;
    if (token) {
      config.headers.Authorization = token;
    } else {
      router.push("/login");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
httpInstance.interceptors.response.use(
  (config) => {
    // 当获取验证码时使用header保存验证码
    const headers = config.headers;
    if (headers["code"] != null) {
      captcha.value = headers["code"];
    }

    return config.data;
  },
  (error) => {
    if (error.response.status === 401) {
      const loginStore = useLoginStore();
      loginStore.clearLoginData();
      router.push("/login");
    }
    const errorMsg: string = error.response.data || "请求失败";
    ElMessage({ type: "warning", message: errorMsg });
    return Promise.reject(error);
  }
);
export default httpInstance;
