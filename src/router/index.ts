import { createRouter, createWebHistory } from "vue-router";
import { useLoginStore } from "@/stores/LoginStore";
import LoginView from "@/views/login/index.vue";
import { initRoutes } from "./initRoutes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      component: LoginView,
    },
  ],
});

const whiteList = ["/login"]; // 白名单路由
let hasInitRoutes = false; // 标记路由是否已经初始化

router.beforeEach(async (to, from, next) => {
  const loginStore = useLoginStore();
  // 获取token，假设存储在localStorage中
  const token = loginStore.userInfo.token;
  if (token) {
    if (to.path === "/login") {
      // 已登录时访问登录页，重定向到首页
      next("/");
    } else {
      // 判断是否已获取用户信息
      if (!hasInitRoutes) {
        try {
          // 防止刷新页面后路由失效,页面丢失
          // 1. 获取用户信息和菜单数据
          const menuData = await loginStore.getMenuData(); // 从后端获取菜单数据

          // 2. 初始化动态路由
          await initRoutes(menuData);

          hasInitRoutes = true;

          // 3. 重要：请求带有 redirect 的页面时需要重新进入
          next({ ...to, replace: true });
        } catch {
          // 处理错误，清除token并跳转登录页
          loginStore.clearLoginData();
          next("/login");
        }
      } else {
        next();
      }
    }
  } else {
    // 未登录时
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next("/login");
    }
  }
});

export default router;
