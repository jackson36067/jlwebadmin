import { defineStore } from "pinia";

import { ref } from "vue";
interface Breadcrumb {
  title: string;
}

/**
 * 保存头部面包屑
 */
export const useBreadcrumbStore = defineStore(
  "breadcrumb",
  () => {
    const breadcrumbs = ref<Array<Breadcrumb>>([{ title: "首页" }]);
    const updateBreadcrumbs = (newBreadcrumbs: Array<Breadcrumb>) => {
      breadcrumbs.value = newBreadcrumbs;
    };
    return { breadcrumbs, updateBreadcrumbs };
  },
  {
    persist: true,
  }
);
