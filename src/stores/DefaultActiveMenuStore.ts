import { defineStore } from "pinia";
import { ref } from "vue";

export const useDefaultActiveMenuStore = defineStore(
  "defaultActiveMenu",
  () => {
    const menuActive = ref("/");
    const changeDefaultMenuActive = (path: string) => {
      menuActive.value = path;
    };
    return { menuActive, changeDefaultMenuActive };
  },
  {
    persist: true,
  }
);
