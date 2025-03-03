<script setup lang="ts">
import logo from "@/assets/images/logo.png";
import { ref, inject } from "vue";
import { useLoginStore } from "@/stores/LoginStore";
import svgIcon from "@/components/svg/svgIcon.vue";
import { useTagsStore } from "@/stores/TagStore";
import { useBreadcrumbStore } from "@/stores/BreadcrumbStore";
import { useDefaultActiveMenuStore } from "@/stores/DefaultActiveMenuStore";
import router from "@/router";

const loginStore = useLoginStore();
const isCollapse = inject("isCollapse", ref(false));

const defaultActiveMenuStore = useDefaultActiveMenuStore();
const menuList = loginStore.userInfo.menuVOList;

const menuSellect = (index: string) => {
  defaultActiveMenuStore.menuActive = index;
};
// 点击首页填转到首页
const mainClick = () => {
  router.push("/");
};

// 点击子菜单跳转页面
const tagsStore = useTagsStore();
const breadcrumbStore = useBreadcrumbStore();
const menuClick = (
  menu: { title: string },
  submenu: { path: string; name: string; title: string }
) => {
  // console.log(key);
  // router.push(submenu.path);
  // 新增标签
  const title = menu.title;
  const { path, name } = submenu;
  const subtitle = submenu.title;
  tagsStore.addView({ path, title, name, subtitle });
  // 修改面包屑
  breadcrumbStore.updateBreadcrumbs([
    { title: menu.title },
    { title: submenu.title },
  ]);
};

// 监测页面宽度大小,一定程度时把菜单折叠起来
const mediaQueryList = window.matchMedia("(min-width:1200px)");
mediaQueryList.addEventListener("change", (event) => {
  if (!event.matches) {
    isCollapse.value = true;
  } else {
    isCollapse.value = false;
  }
});

// 获取是否展示logo
const isShowLogo = inject("isShowLogo", ref(true));
</script>
<template>
  <div class="content" :class="[{ updateWidth: isCollapse }]">
    <div class="logo" v-if="isShowLogo">
      <a href="#" class="a" :class="[{ updateWidth: isCollapse }]">
        <img :src="logo" alt="" />
        <h5 v-if="!isCollapse">jackson-后台管理</h5>
      </a>
    </div>
    <div class="menu">
      <el-menu
        mode="vertical"
        :default-active="defaultActiveMenuStore.menuActive"
        class="el-menu-vertical-demo custom-menu"
        :collapse="isCollapse"
        text-color="rgb(191, 203, 217)"
        background-color="#304156"
        :unique-opened="true"
        :collapse-transition="false"
        @select="menuSellect"
        router
      >
        <el-menu-item index="/" @click="mainClick">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="首页"
            placement="right"
            :offset="35"
          >
            <svg-icon
              name="index"
              color="#fff"
              style="display: flex"
            ></svg-icon>
          </el-tooltip>
          <span style="margin-left: 14px">首页</span>
        </el-menu-item>
        <el-sub-menu v-for="menu in menuList" :key="menu.id" :index="menu.id">
          <template #title>
            <svg-icon
              :name="menu.icon"
              color="#fff"
              style="display: flex"
            ></svg-icon>
            <span style="margin-left: 14px">{{ menu.title }}</span>
          </template>

          <el-menu-item
            background-color="#1f2d3d"
            :index="submenu.path"
            v-for="submenu in menu.subMenuVOList"
            :key="submenu.pid"
            class="el-menu-item"
            @click="menuClick(menu, submenu)"
          >
            <svg-icon :name="submenu.icon" color="#fff" style="display: flex">
            </svg-icon>
            <span style="margin-left: 14px">{{ submenu.title }}</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
  </div>
</template>
<style scoped lang="scss">
.content {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: fixed;
  z-index: 999999;
  top: 0;
  left: 0%;
  width: 199px;
  transition: width 0.3s;
  .logo {
    width: 100%;
    .a {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      position: relative;
      justify-content: center;
      align-items: center;
      height: 50px;
      color: #fff;
      text-align: center;
      padding: 4px 8px 4px 10px;
      line-height: 50px;
      background-color: #304156;
      box-sizing: border-box;
      img {
        width: 32px;
        height: 32px;
      }
      h5 {
        width: 100%;
        font-weight: 700;
        font-size: 16px;
      }
    }
    .updateWidth {
      width: 59px;
    }
  }
  .menu {
    // 剩余空间全部给菜单栏
    flex: 1;
    .el-menu {
      // 缩起来时的宽度
      width: 60px;
      height: 100%;
      .el-menu-item .el-sub-menu {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }
      .el-sub-menu.is-opened {
        .el-menu-item {
          background-color: #1f2d3d !important;
          &:hover {
            background-color: #001528 !important;
          }
        }
      }
    }
  }
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 100%;
    border-right: 1px solid #304156;
  }
}
.updateWidth {
  width: 59px;
}
</style>
