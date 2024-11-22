<script setup lang="ts">
import { ElMessage } from "element-plus";
import { inject } from "vue";
import { ref } from "vue";

const iconList = ref<Array<string>>([
  "alipay",
  "anq",
  "app",
  "backup",
  "blog",
  "chain",
  "chart",
  "codeConsole",
  "dashboard",
  "database",
  "date",
  "deploy",
  "dept",
  "dev",
  "develop",
  "dictionary",
  "doc",
  "download",
  "edit",
  "education",
  "email",
  "error",
  "exit-fullscreen",
  "fullscreen",
  "fwb",
  "github",
  "gonggao",
  "grid",
  "icon",
  "image",
  "index",
  "international",
  "ipvisits",
  "java",
  "layout",
  "link",
  "list",
  "lock",
  "log",
  "login",
  "markdown",
  "menu",
  "message",
  "mnt",
  "money",
  "monitor",
  "nested",
  "password",
  "people",
  "peoples",
  "permission",
  "phone",
  "qiniu",
  "quanpin",
  "redis",
  "refresh",
  "role",
  "search",
  "server",
  "shopping",
  "size",
  "skill",
  "source",
  "sqlMonitor",
  "Steve-Jobs",
  "swagger",
  "sys-tools",
  "system",
  "system1",
  "tab",
  "theme",
  "timing",
  "tools",
  "tree-table",
  "tree",
  "unlock",
  "user",
  "user1",
  "validCode",
  "visits",
  "web",
  "wechat",
  "weixin",
  "zujian",
]);

const isCollapse = inject("isCollapse");

// 点击复制svg图标
const copyToClipboard = (icon: string) => {
  const content = `<svg-icon name='${icon}' />`;
  // 保存content到复制区
  navigator.clipboard
    .writeText(content)
    .then(() => {
      ElMessage.success(`Copy Successfully`);
    })
    .catch((err) => {
      ElMessage.error("复制失败，请重试");
      console.error(err);
    });
};
</script>
<template>
  <div class="body" :class="{ left: isCollapse }">
    <div class="icons-container">
      <div class="add">
        <el-link
          :underline="false"
          style="font-size: 16px"
          href="https://panjiachen.github.io/vue-element-admin-site/guide/advanced/icon.html#generate-icon-library-code"
          target="_blank"
          >Add and use</el-link
        >
      </div>
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>图标展示</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="2" v-for="(icon, index) in iconList" :key="index">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="`<svg-icon name='${icon}' />`"
              placement="top-start"
            >
              <div class="icon-item" @click="copyToClipboard(icon)">
                <SvgIcon :name="icon" width="25" height="25" />
                <span class="icon-name">{{ icon }}</span>
              </div>
            </el-tooltip>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>
<style lang="scss" scoped>
// 变量定义
$primary-text-color: #606266;
$hover-bg-color: #f5f7fa;
$transition-time: 0.3s;
$icon-size: 24px;
$spacing: 20px;

.body {
  box-sizing: border-box;
  position: absolute;
  left: 199px;
  top: 80px;
  width: calc(100% - 199px);
  padding: 26px 32px;
  .icons-container {
    // padding: $spacing;
    .add {
      width: 100%;
      background-color: #eef1f6;
      padding: 20px;
      box-sizing: border-box;
      margin-bottom: 20px;
    }
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: $spacing;
      cursor: pointer;
      transition: all $transition-time;

      &:hover {
        background: $hover-bg-color;
        border-radius: 4px;
      }

      .icon-name {
        margin-top: 10px;
        font-size: 16px;
        color: #000;
      }

      .el-icon {
        font-size: $icon-size;
      }
    }
  }
}

.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
