import axios from "axios";
import { useLoginStore } from "@/stores/LoginStore";
import router from "@/router";
import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/el-message.css";
const httpInstance = axios.create({
  baseURL: "http://localhost:8080/admin/",
  timeout: 5000,
});
httpInstance.interceptors.request.use(
  (config) => {
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
