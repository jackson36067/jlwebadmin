<script setup lang="ts">
import svgIcon from "@/components/svg/svgIcon.vue";
import { inject, ref, onMounted, onBeforeUnmount } from "vue";
import avatar from "@/assets/images/avatar.png";
import router from "@/router";
import { logoutAPI } from "@/apis/user";
import { useLoginStore } from "@/stores/LoginStore";
import { useBreadcrumbStore } from "@/stores/BreadcrumbStore";
import { useTagsStore } from "@/stores/TagStore";
import { useDefaultActiveMenuStore } from "@/stores/DefaultActiveMenuStore";
import { ElMessage, ElMessageBox } from "element-plus";

const isCollapse = inject("isCollapse", ref(false));
const doCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 获取面包屑
const breadcrumbStore = useBreadcrumbStore();

const input = ref("");
// 是否隐藏查询表单变量
const isOpacity = ref(false);
// 隐藏就是把宽度改变达到隐藏的效果
const doOpacity = () => {
  isOpacity.value = isOpacity.value ? false : true;
  // 控制表单的内容
  input.value = isOpacity.value ? "" : input.value;
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

// 点击头像下拉菜单布局设置后的抽屉可见性
const drawer = ref(false);

// 抽屉中tag以及logo是否可见性
const isShowLogo = inject("isShowLogo", ref(true));
const isShowTag = inject("isShowTag", ref(true));

// 菜单数据
const loginStore = useLoginStore();
const formatMenu = (menuVOList) => {
  return menuVOList.map((item) => {
    return {
      name: item.title,
      children: item.subMenuVOList ? formatMenu(item.subMenuVOList) : [],
      path: item.path,
    };
  });
};

// 将菜单结构扁平化为一维数组
const flatMenu = ref<Array<object>>([]);
const flattenMenu = (tree, parentPath = "") => {
  tree.forEach((menu) => {
    const currentLabel = parentPath
      ? `${parentPath}  >  ${menu.name}`
      : menu.name;
    if (menu.children) {
      flattenMenu(menu.children, currentLabel);
    }
    flatMenu.value.push({ label: currentLabel, path: menu.path });
  });
};

// 输入框绑定的内容
const query = ref("");

// 搜索方法
// 在组件挂载时只执行一次
onMounted(() => {
  const menuTree = formatMenu(loginStore.userInfo.menuVOList);
  flattenMenu(menuTree);
});
const fetchSuggestions = (inputValue: string, callback) => {
  console.log(flatMenu.value);
  if (!inputValue) {
    callback([]);
    return;
  }
  // 根据输入内容模糊匹配菜单名称
  // 过滤菜单项，确保 menu 和 menu.label 存在
  const suggestions = flatMenu.value.reverse().filter((item) => {
    return item.label.includes(inputValue);
  });
  console.log(suggestions);
  callback(suggestions);
};

// 跳转到对应路径
const tagStore = useTagsStore();
const defaultActiveMenu = useDefaultActiveMenuStore();
const handleSelect = (item) => {
  // console.log("选中菜单:", item);
  if (item.path) {
    router.push(item.path); // 跳转到对应路径
    const titles = item.label.split(">");
    const subtitle = titles[1];
    const title = titles[0];
    const { path } = item;
    const name = "";
    // 新增标签
    tagStore.addView({ path, subtitle, name, title });
    // 修改面包屑
    breadcrumbStore.updateBreadcrumbs([{ title: title }, { title: subtitle }]);
    // 修改默认路径
    defaultActiveMenu.menuActive = path;
  }
};

// 跳转至中心页
const toCenter = () => {
  const path = "/center";
  router.push(path);
  const title = "";
  const subtitle = "个人中心";
  const name = "";
  // 新增标签
  tagStore.addView({ path, subtitle, name, title });
  // 修改面包屑
  breadcrumbStore.breadcrumbs = [{ title: subtitle }];
  // 修改默认路径
  defaultActiveMenu.menuActive = path;
};
</script>
<template>
  <div class="header" :class="{ left: isCollapse }">
    <div class="menu-index">
      <a href="#" @click="doCollapse">
        <svgIcon name="list" class="svg-icon" width="30px" height="20px" />
      </a>
      <span>
        <el-breadcrumb separator="/" style="color: #afbccd">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <template v-if="breadcrumbStore.breadcrumbs.length > 0">
            <el-breadcrumb-item
              v-for="(item, index) in breadcrumbStore.breadcrumbs"
              :key="index"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </template>
        </el-breadcrumb>
      </span>
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
        <el-autocomplete
          v-if="isOpacity"
          v-model="query"
          :fetch-suggestions="fetchSuggestions"
          clearable
          class="inline-input w-50"
          placeholder="Search"
          @select="handleSelect"
        >
          <!-- 添加自定义模板来显示建议项 -->
          <template #default="{ item }">
            <div>{{ item.label }}</div>
          </template>
        </el-autocomplete>
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
              <el-dropdown-item @click="drawer = true"
                >布局设置</el-dropdown-item
              >
              <el-dropdown-item @click="toCenter">个人中心</el-dropdown-item>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </a>
    </div>
  </div>
  <el-drawer
    v-model="drawer"
    size="260px"
    class="custom-drawer"
    destroy-on-close
    :show-close="false"
  >
    <div class="title">系统布局设置</div>
    <div class="switch">
      <span>显示标签</span>
      <el-switch
        v-model="isShowTag"
        active-color="#212121"
        inactive-color="#dcdfe6"
      />
    </div>
    <div class="switch">
      <span>显示LOGO</span>
      <el-switch
        v-model="isShowLogo"
        :active-color="'#212121'"
        :inactive-color="'#dcdfe6'"
      />
    </div>
  </el-drawer>
</template>
<style lang="scss">
.header {
  position: absolute;
  top: 0;
  left: 199px;
  width: calc(100% - 199px);
  height: 50px;
  border-bottom: 1px solid #dadcdf;
  box-sizing: border-box;
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
      position: relative;
      float: left;
      display: flex;
      align-items: center;
      height: 50px;
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
      .menu-card {
        position: absolute;
        top: 60px;
        left: 50px;
        margin-bottom: 16px;
        width: 170px;
        padding: 16px;
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

.el-drawer__header {
  padding: 0; /* 移除标题的内边距 */
  margin: 0; /* 移除多余的外边距 */
}
.custom-drawer {
  .title {
    font-size: 14px;
    font-weight: 700;
    color: #2e2e2e;
    margin-top: 20px;
    padding: 0;
    text-align: left;
  }
  .switch {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    span {
      color: #6a6a6a;
      font-weight: 500;
      font-size: 14px;
      line-height: 32px; // switch的高为32px,让文字垂直居中显示
    }
    &:first-child {
      margin-top: 0;
    }
    /* 激活时的背景颜色 */
    .el-switch.is-checked .el-switch__core {
      background-color: #212121 !important; /* 激活时的背景颜色 */
      border: none;
    }
  }
}
</style>
