import { componentMap } from "./dynamicComponents";
import router from ".";
// 将菜单中所有子菜单放到一个数组中
export const extractSubMenus = (menuData: any[]): any[] => {
  const subMenus: any[] = [];
  menuData.forEach((item) => {
    if (item.subMenuVOList && item.subMenuVOList.length > 0) {
      subMenus.push(...item.subMenuVOList);
    }
  });

  return subMenus;
};

// 将菜单数据转换成路由数组
export const generateRoutesFromSubMenus = (subMenus: any[]) => {
  return subMenus.map((menu) => ({
    path: menu.path,
    name: menu.title,
    component: componentMap[menu.name], // 动态加载组件
    meta: {
      title: menu.title,
      icon: menu.icon,
    },
  }));
};

// 添加路由
export async function addRoutesToHome(menuData: any[]) {
  // 将所有菜单的子菜单加入到一个数组中
  const subMenus = extractSubMenus(menuData);
  // 将菜单数组变换成路由形式数组
  const childRoutes = generateRoutesFromSubMenus(subMenus);
  // 引入首页router
  childRoutes.push({
    path: "",
    name: "Home",
    component: () => import("@/views/system/home/homeView.vue"),
    meta: {
      title: "首页",
      icon: "",
    },
  });
  // 引入个人中心router
  childRoutes.push({
    path: "center",
    name: "Center",
    component: () => import("@/views/personCenter/index.vue"),
    meta: {
      title: "个人中心",
      icon: "",
    },
  });
  // 生成路由
  const homeRoute = {
    path: "/",
    name: "Layout",
    component: () => import("@/views/layout/index.vue"),
    children: childRoutes,
  };
  // 添加路由
  router.addRoute(homeRoute);
}

// 实现动态加载路由 -> 完成登录时新增路由
export async function initRoutes(menuData: any[]) {
  await addRoutesToHome(menuData);
}
