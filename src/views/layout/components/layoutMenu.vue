<script setup lang="ts">
import { inject, ref } from "vue";
import { useTagsStore } from "@/stores/TagStore";
import { useRoute, useRouter } from "vue-router";
import { useDefaultActiveMenuStore } from "@/stores/DefaultActiveMenuStore";
import { useBreadcrumbStore } from "@/stores/BreadcrumbStore";

const isCollapse = inject("isCollapse", ref(false));

const defaultActiveMenuStore = useDefaultActiveMenuStore();
// 引入默认显示菜单路径
interface view {
  path: string;
  title: string;
  name: string;
  subtitle: string;
}

const route = useRoute();
const router = useRouter();
const tagsStore = useTagsStore();
const breadcrumbStore = useBreadcrumbStore();
const isActive = (tag: view) => {
  const isTagActive = ref(true);
  if (tag.path !== route.path) {
    isTagActive.value = false;
  }
  return isTagActive.value ? "active-tag" : "inactive-tag";
};

const closeTag = (tag: view) => {
  tagsStore.deleteView(tag);
};
const goTo = (tag: view) => {
  router.push(tag.path);
  isActive(tag);
  // 修改默认显示菜单
  defaultActiveMenuStore.menuActive = tag.path;
  // 如果是首页就修改面包屑为空
  if (tag.path === "/") {
    breadcrumbStore.updateBreadcrumbs([]);
  } else {
    breadcrumbStore.updateBreadcrumbs([
      { title: tag.title },
      { title: tag.subtitle },
    ]);
  }
};

// 是否展示标签页
const isShowTag = inject("isShowTag", ref(true));
</script>
<template>
  <div class="menu-tap" :class="{ updateWidth: isCollapse }" v-if="isShowTag">
    <el-tag
      v-for="tag in tagsStore.visitedViews"
      :key="tag.path"
      :closable="tag.path !== '/'"
      :class="isActive(tag)"
      @click="goTo(tag)"
      @close="closeTag(tag)"
    >
      {{ tag.subtitle }}
    </el-tag>
  </div>
</template>
<style scoped lang="scss">
.menu-tap {
  position: absolute;
  top: 50px;
  left: 199px;
  width: calc(100% - 199px);
  height: 30px;
  box-shadow: 0 2px #dadcdf;
  padding-left: 6px;
  box-sizing: border-box;
}
.active-tag {
  display: inline-block;
  height: 26px;
  line-height: 26px;
  padding: 0 8px;
  font-size: 12px;
  border: 1px solid #d8dce5;
  color: #fff;
  background-color: #42b983;
  margin: 2px 0 0 8px;
  cursor: pointer;
  &::before {
    display: inline-block;
    content: "";
    background-color: #fff;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
  }
}
.inactive-tag {
  display: inline-block;
  height: 26px;
  line-height: 26px;
  padding: 0 8px;
  font-size: 12px;
  border: 1px solid #d8dce5;
  color: #909393;
  background-color: #fff;
  margin: 2px 0 0 8px;
  cursor: pointer;
}
.updateWidth {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
