<script setup lang="ts">
import layoutAside from "./components/layoutAside.vue";
import layoutHeader from "./components/layoutHeader.vue";
import layoutFooter from "./components/layoutFooter.vue";
import layoutMenu from "./components/layoutMenu.vue";
import { ref, provide, watch } from "vue";
import { useRoute } from "vue-router";

// 注入左侧菜单栏显示与否值
const isCollapse = ref(false);
provide("isCollapse", isCollapse);

// 提供是否显示LOGO以及标签
const isShowLogo = ref(true);
const isShowTag = ref(true);
provide("isShowLogo", isShowLogo);
provide("isShowTag", isShowTag);

const route = useRoute();

const showProgress = ref(false); // 控制进度条显示
// 监听路由变化，触发进度条
watch(
  () => route.fullPath,
  () => {
    showProgress.value = true; // 显示进度条
    setTimeout(() => {
      showProgress.value = false; // 隐藏进度条并切换组件
    }, 300); // 设置进度条动画时间
  }
);
</script>
<template>
  <div class="layout">
    <div v-if="showProgress" class="progress-bar"></div>
    <layout-aside />
    <layoutHeader />
    <layoutMenu />
    <!-- 路由视图 -->
    <router-view v-slot="{ Component }">
      <component v-if="!showProgress" :is="Component" />
    </router-view>
    <layoutFooter />
  </div>
</template>

<style>
/* 进度条样式 */
.layout {
  width: 100%;
  position: relative; /* 给进度条提供定位参考 */
}
.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(to right, #2299dd, #2299dd);
  width: 0;
  animation: progress 0.3s linear forwards;
}

/* 进度条动画 */
@keyframes progress {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}
</style>
