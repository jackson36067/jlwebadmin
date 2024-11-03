<script setup lang="ts">
import layoutAside from "./components/layoutAside.vue";
import layoutHeader from "./components/layoutHeader.vue";
import layoutFooter from "./components/layoutFooter.vue";
import layoutMenu from "./components/layoutMenu.vue";
import { ref, provide } from "vue";
// 注入左侧菜单栏显示与否值
const isCollapse = ref(false);
provide("isCollapse", isCollapse);
</script>
<template>
  <layout-aside />
  <layoutHeader />
  <layoutMenu />
  <router-view />
  <layoutFooter />
</template>
