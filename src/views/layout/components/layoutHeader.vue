<script setup lang="ts">
import svgIcon from "@/components/svg/svgIcon.vue";
import { inject, ref, onMounted, onBeforeUnmount } from "vue";
import avatar from "@/assets/images/avatar.png";
import router from "@/router";
import { logoutAPI } from "@/apis/user";
import { useLoginStore } from "@/stores/LoginStore";
import { ElMessage, ElMessageBox } from "element-plus";

const isCollapse = inject("isCollapse", ref(false));
const doCollapse = () => {
  isCollapse.value = !isCollapse.value;
};
const input = ref("");
// 是否隐藏查询表单变量
const isOpacity = ref("0");
// 隐藏就是把宽度改变达到隐藏的效果
const doOpacity = () => {
  isOpacity.value = isOpacity.value === "0" ? "240px" : "0";
  // 控制表单的内容
  input.value = isOpacity.value === "0" ? "" : input.value;
};

// 跳转至文档
const toDoc = () => {
  window.open("https://github.com/jackson36067/jlwebadmin", "_blank"); // 在新标签页中打开
};

// 监测页面宽度大小,一定程度时把去了头像外的图标全部隐藏
const isShow = ref(true);
const mediaQueryList = window.matchMedia("(min-width: 1020px)");
mediaQueryList.addEventListener("change", (event) => {
  if (!event.matches) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
});

// 控制是否全屏展示
const isFullscreen = ref(false);
const toggleFullscreen = () => {
  if (!isFullscreen.value) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true; // 更新全屏状态
    });
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false; // 更新全屏状态
    });
  }
};
const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement; // 更新全屏状态
};
// 监听全屏变化事件
onMounted(() => {
  document.addEventListener("fullscreenchange", onFullscreenChange);
});
// 移除事件监听器
onBeforeUnmount(() => {
  document.removeEventListener("fullscreenchange", onFullscreenChange);
});
// 退出登录
const logout = async () => {
  ElMessageBox.confirm("你确认要退出吗", "Warning", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      // 发起退出登录请求
      await logoutAPI();
      // 清空用户存储
      const LoginStore = useLoginStore();
      LoginStore.clearLoginData();
      // 将页面跳转至登录页
      router.push("/login");
      ElMessage({
        type: "success",
        message: "退出成功",
      });
    })
    .catch(() => {
      // 取消修改也要刷新页面
      ElMessage({
        type: "error",
        message: "退出失败",
      });
    });
};
</script>
<template>
  <div class="header" :class="{ left: isCollapse }">
    <div class="menu-index">
      <a href="#" @click="doCollapse">
        <svgIcon name="list" class="svg-icon" width="30px" height="20px" />
      </a>
      <span>首页</span>
    </div>
    <div class="user">
      <a href="#" v-if="isShow">
        <svgIcon
          name="search"
          width="20px"
          height="20px"
          class="svg-icon1"
          @click="doOpacity"
          color="#707070"
        />
        <input
          type="text"
          v-model="input"
          placeholder="Search"
          class="input"
          :style="'width:' + isOpacity + ''"
        />
      </a>
      <a href="#" v-if="isShow">
        <el-popover
          placement="bottom"
          trigger="hover"
          content="项目文档"
          effect="dark"
          popper-class="el-popover"
          popper-style="text-align: center; font-size: 12px"
        >
          <template #reference>
            <svgIcon
              name="doc"
              class="svg-icon"
              width="30px"
              height="20px"
              @click="toDoc"
            />
          </template>
        </el-popover>
      </a>
      <a href="#" v-if="isShow">
        <el-popover
          placement="bottom"
          trigger="hover"
          content="全屏缩放"
          effect="dark"
          popper-class="el-popover"
          popper-style="text-align: center; font-size: 12px"
        >
          <template #reference>
            <svgIcon
              name="quanpin"
              color="#707070"
              class="svg-icon"
              width="30px"
              height="20px"
              @click="toggleFullscreen"
              v-if="!isFullscreen"
            />
            <svgIcon
              name="exitQuanPin"
              color="#707070"
              class="svg-icon"
              width="30px"
              height="20px"
              @click="toggleFullscreen"
              v-else
            />
          </template>
        </el-popover>
      </a>
      <a href="#" v-if="isShow">
        <el-popover
          placement="bottom"
          trigger="hover"
          content="布局设置"
          effect="dark"
          popper-class="el-popover"
          popper-style="text-align: center; font-size: 12px"
        >
          <template #reference>
            <svgIcon
              name="layout"
              color="#707070"
              class="svg-icon"
              width="30px"
              height="20px"
            />
          </template>
        </el-popover>
      </a>
      <a href="#">
        <el-dropdown placement="bottom" trigger="click" class="dropdown">
          <img :src="avatar" alt="" class="img" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>布局设置</el-dropdown-item>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </a>
    </div>
  </div>
</template>
<style lang="scss">
.header {
  position: absolute;
  top: 0;
  left: 199px;
  width: calc(100% - 199px);
  height: 50px;
  border-bottom: 1px solid #dadcdf;
  // box-shadow: 0 -5px #dadcdf;
  .menu-index {
    display: flex;
    float: left;
    a {
      width: 50px;
      height: 50px;
      text-align: center;
      margin-right: 15px;
      .svg-icon {
        margin-top: 14px;
      }
    }
    span {
      height: 50px;
      line-height: 50px;
      color: #97a8be;
    }
  }
  .user {
    float: right;
    a {
      float: left;
      display: flex;
      align-items: center;
      height: 50px;
      // margin-right: 30px;
      .svg-icon1 {
        margin: 4px 10px 0;
      }
      .svg-icon {
        margin: 2px 10px 0;
        outline: none;
      }
      .input {
        width: 240px;
        height: 40px;
        border: none;
        border-bottom: 1px solid #000;
        // 取消点击时的默认边框
        outline: none;
        transition: width 0.3s;
      }
      .img {
        margin: 0 10px;
        width: 40px;
      }
      .dropdown:hover .svg-icon {
        outline: none; /* 清除悬停时的边框 */
      }
      .el-dropdown-item {
        background-color: #000; /* 修改为你想要的背景颜色 */
      }
    }
  }
}
.el-popover {
  min-width: 60px !important;
  width: 80px !important;
}
.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
