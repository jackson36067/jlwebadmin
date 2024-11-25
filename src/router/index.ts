import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/login/index.vue";
import layout from "@/views/layout/index.vue";
import homeView from "@/views/system/home/homeView.vue";
import usreView from "@/views/system/user/index.vue";
import roleView from "@/views/system/role/index.vue";
import menuView from "@/views/system/menu/index.vue";
import deptView from "@/views/system/dept/index.vue";
import timingView from "@/views/system/timing/index.vue";
import onlineView from "@/views/monitor/online/index.vue";
import logView from "@/views/monitor/log/index.vue";
import centerView from "@/views/personCenter/index.vue";
import errorLogView from "@/views/monitor/errorLog/index.vue";
import iconView from "@/components/icons/index.vue";
import editorView from "@/components/editor/index.vue";
import markdownView from "@/components/markdown/index.vue";
import chatView from "@/views/tools/chat/index.vue";
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
          meta: { requiresAuth: true, transitionName: "slide" },
        },
        {
          path: "user",
          component: usreView,
          meta: { transitionName: "fade" },
        },
        {
          path: "role",
          component: roleView,
          meta: { transitionName: "fade" },
        },
        {
          path: "menu",
          component: menuView,
          meta: { transitionName: "fade" },
        },
        {
          path: "dept",
          component: deptView,
          meta: { transitionName: "fade" },
        },
        {
          path: "timing",
          component: timingView,
          meta: { transitionName: "fade" },
        },
        {
          path: "online",
          component: onlineView,
          meta: { transitionName: "fade" },
        },
        {
          path: "logs",
          component: logView,
          meta: { transitionName: "fade" },
        },
        {
          path: "center",
          component: centerView,
        },
        {
          path: "errorLog",
          component: errorLogView,
        },
        {
          path: "icon",
          component: iconView,
        },
        {
          path: "tinymce",
          component: editorView,
        },
        {
          path: "markdown",
          component: markdownView,
        },
        {
          path: "chat",
          component: chatView,
        },
      ],
    },
    {
      path: "/login",
      component: LoginView,
      meta: { transitionName: "fade" },
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
