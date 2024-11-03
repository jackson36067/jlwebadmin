<script setup lang="ts">
import logo from "@/assets/images/logo.png";
import { provide, ref, inject, watch } from "vue";
import { useLoginStore } from "@/stores/LoginStore";
import svgIcon from "@/components/svg/svgIcon.vue";
import router from "@/router";

const loginStore = useLoginStore();
const isCollapse = inject("isCollapse", ref(false));
const menuList: object = loginStore.userInfo.menuVOList;
const menuActive = ref("/");
const menuSellect = (index: string) => {
  menuActive.value = index;
};
const menuOpen = () => {
  // isCollapse.value = false;
};
const menuClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

// 点击首页填转到首页
const mainClick = () => {
  router.push("/");
};

// 点击子菜单跳转页面
const menuClick = (path: string) => {
  // console.log(key);
  router.push(`/${path}`);
};

// 监测页面宽度大小,一定程度时把菜单折叠起来
const mediaQueryList = window.matchMedia("(min-width:760px)");
mediaQueryList.addEventListener("change", (event) => {
  if (!event.matches) {
    isCollapse.value = true;
  } else {
    isCollapse.value = false;
  }
});
</script>
<template>
  <div class="content">
    <div class="logo">
      <a href="#" class="a" :class="{ updateWidth: isCollapse }">
        <img :src="logo" alt="" />
        <h5 v-if="!isCollapse">jackson-后台管理</h5>
      </a>
    </div>
    <div class="menu">
      <el-menu
        mode="vertical"
        :default-active="menuActive"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        text-color="rgb(191, 203, 217)"
        background-color="#304156"
        :unique-opened="true"
        :collapse-transition="false"
        @select="menuSellect"
        @open="menuOpen"
        @close="menuClose"
        hide-timeout="0.3s"
      >
        <el-menu-item index="/" @click="mainClick">
          <svg-icon name="index" class="svg-icon"></svg-icon>
          <span class="span-menu">首页</span>
        </el-menu-item>
        <el-sub-menu v-for="menu in menuList" :key="menu.id" :index="menu.id">
          <template #title>
            <svg-icon :name="menu.icon" class="svg-icon"></svg-icon>
            <span class="span-menu">{{ menu.title }}</span>
          </template>

          <el-menu-item
            :index="submenu.component"
            v-for="submenu in menu.subMenuVOList"
            :key="submenu.pid"
            class="el-menu-item"
            @click="menuClick(submenu.path)"
          >
            <svg-icon
              :name="submenu.icon"
              class="sub-svg-icon"
              color="#bfbfbf"
            ></svg-icon
            ><span class="sub-span-menu">{{ submenu.title }}</span>
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
  position: fixed;
  top: 0;
  left: 0;
  width: 199px;
  height: 100%;
  .logo {
    .a {
      box-sizing: border-box;
      display: flex;
      position: relative;
      justify-items: auto;
      align-items: center;
      width: 199px;
      height: 50px;
      color: #fff;
      text-align: center;
      padding: 4px 0 4px 8px;
      line-height: 50px;
      background-color: #304156;
      img {
        width: 32px;
        height: 32px;
        margin: 0 4px 0 6px;
      }
      h5 {
        position: absolute;
        left: 55px;
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
    flex-grow: 1;
    .el-menu {
      position: relative;
      // 缩起来时的宽度
      width: 60px;
      height: 100%;
      transition: width 0.3s;
      .svg-icon {
        position: absolute;
        top: -36%;
        left: 20px;
      }
      .span-menu {
        position: absolute;
        left: 50px;
      }
      .sub-svg-icon {
        position: absolute;
        top: -36%;
        left: 40px;
      }
      .sub-span-menu {
        position: absolute;
        left: 70px;
      }
    }
  }

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
  }
}
</style>
