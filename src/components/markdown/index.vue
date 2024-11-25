<script setup lang="ts">
import { inject, ref } from "vue";

const isCollapse = inject("isCollapse");

const text = ref("");
</script>
<template>
  <div class="body" :class="{ left: isCollapse }">
    <div class="text" style="margin-bottom: 10px">
      Markdown基于
      <el-link
        :underline="false"
        href="https://github.com/code-farmer-i/vue-markdown-editor"
        target="_blank"
        style="font-size: 14px"
        >VueMarkdownEditor</el-link
      >
    </div>
    <v-md-editor
      v-model="text"
      height="780px"
      :toolbars="['bold', 'italic', 'underline', 'upload', 'insertCode']"
      placeholder="开始编辑..."
    ></v-md-editor>
  </div>
</template>
<style>
.body {
  box-sizing: border-box;
  position: absolute;
  left: 199px;
  top: 80px;
  width: calc(100% - 199px);
  padding: 26px 32px;
}
.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
