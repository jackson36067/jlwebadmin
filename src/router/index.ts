import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/login/index.vue";
import layout from "@/views/layout/index.vue";
import homeView from "@/views/home/homeView.vue";
import usreView from "@/views/user/index.vue";
import roleView from "@/views/role/index.vue";
import menuView from "@/views/menu/index.vue";
import { useLoginStore } from "@/stores/LoginStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: layout,
      children: [
        {
          path: "",
          component: homeView,
          meta: { requiresAuth: true },
        },
        {
          path: "/user",
          component: usreView,
        },
        {
          path: "/role",
          component: roleView,
        },
        {
          path: "/menu",
          component: menuView,
        },
      ],
    },
    {
      path: "/login",
      component: LoginView,
    },
  ],
});

// 路由守护
// 在你的路由配置中，使用 meta 属性来标记需要认证的页面。例如，设置 requiresAuth: true 来标记需要登录的页面。
router.beforeEach((to, from, next) => {
  const loginStore = useLoginStore();
  const isAuthenticated = loginStore.userInfo.token; // 检查是否存在 token

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // 如果路由需要认证
    if (!isAuthenticated) {
      // 如果用户未登录，重定向到登录页
      router.push("/login");
    } else {
      next(); // 继续访问目标路由
    }
  } else {
    next(); // 不需要认证的路由，继续访问
  }
});

export default router;
