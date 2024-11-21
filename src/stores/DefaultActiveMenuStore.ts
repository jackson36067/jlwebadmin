import { defineStore } from "pinia";
import { ref } from "vue";

export const useDefaultActiveMenuStore = defineStore(
  "defaultActiveMenu",
  () => {
    const menuActive = ref("/");
    return { menuActive };
  },
  {
    persist: true,
  }
);
