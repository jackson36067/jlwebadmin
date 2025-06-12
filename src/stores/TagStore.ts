import { defineStore } from "pinia";
import { useRoute } from "vue-router";
import { useDefaultActiveMenuStore } from "./DefaultActiveMenuStore";
import { useBreadcrumbStore } from "./BreadcrumbStore";
import router from "@/router";
import { ref } from "vue";
interface view {
  path: string;
  title: string;
  name: string;
  subtitle: string;
}
export const useTagsStore = defineStore(
  "tags",
  () => {
    const route = useRoute();
    const breadcrum = useBreadcrumbStore();
    // 保存标签页
    const visitedViews = ref([
      {
        path: "/",
        subtitle: "首页",
        name: "home",
        title: "",
      },
    ]);

    // 新增标签页
    const addView = (view: view) => {
      if (visitedViews.value.some((v) => v.path === view.path)) return;
      visitedViews.value.push({
        path: view.path,
        title: view.title || "unknown",
        name: view.name,
        subtitle: view.subtitle,
      });
      // 新增后跳转到当前页
      router.push(view.path);
    };

    // 删除标签页
    const defaultActiveMenuStore = useDefaultActiveMenuStore();
    const deleteView = (view: view) => {
      // 获取删除的标签页的索引
      const index = visitedViews.value.findIndex((v) => v.path === view.path);
      if (index > -1) {
        visitedViews.value.splice(index, 1);
        // 如果删除的是当前页,则跳转到前一个标签
        if (view.path === route.path) {
          const lastView =
            visitedViews.value[index - 1] || visitedViews.value[0];
          router.push(lastView.path);
          defaultActiveMenuStore.menuActive = lastView.path;
          // 如果删除的是首页的前一个标签,且只有这两个标签时,将面包屑内容清空
          if (index === 1) {
            breadcrum.updateBreadcrumbs([]);
          } else {
            breadcrum.updateBreadcrumbs([
              { title: lastView.title },
              { title: lastView.subtitle },
            ]);
          }
        }
      }
    };

    // 初始化时添加当前路由到标签页
    const breadcrumbStore = useBreadcrumbStore();
    const clearTags = () => {
      visitedViews.value = [
        {
          path: "/",
          subtitle: "首页",
          name: "home",
          title: "",
        },
      ];
      defaultActiveMenuStore.menuActive = "/";
      breadcrumbStore.updateBreadcrumbs([{ title: "" }]);
      router.push("/login");
    };

    return { visitedViews, addView, deleteView, clearTags };
  },
  {
    persist: true,
  }
);
