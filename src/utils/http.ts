import axios from "axios";
import { useLoginStore } from "@/stores/LoginStore";
import router from "@/router";
import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/el-message.css";
import { ref } from "vue";
const httpInstance = axios.create({
  baseURL: "http://localhost:8081/admin/",
  timeout: 5000,
});
// 验证码
const code = ref("");
httpInstance.interceptors.request.use(
  (config) => {
    // 发起请求时携带验证码
    if (config.headers.code == null) {
      config.headers.Code = code.value;
    }
    const loginStore = useLoginStore();
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
      code.value = headers["code"];
    }
    // 下载文件,获取图片的接口走这里
    const urls = [
      "user/code",
      "log/export",
      "menu/export",
      "dept/export",
      "role/export",
      "quartz/export",
      "quartz/log/export",
      "user/export",
      "user/online/export",
    ];
    if (urls.includes(config.config.url)) {
      return config;
    }
    return config.data;
  },
  (error) => {
    if (error.response.status === 401) {
      const loginStore = useLoginStore();
      loginStore.clearLoginData();
      router.push("/login");
    }
    const errorMsg: string = error.response.data.msg || "请求失败";
    ElMessage({ type: "warning", message: errorMsg });
    return Promise.reject(error);
  }
);
export default httpInstance;
