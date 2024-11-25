<script setup lang="ts">
import { inject, ref, shallowRef, onMounted, onBeforeUnmount } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import "@wangeditor/editor/dist/css/style.css"; // 必须引入样式文件
import { ElMessage } from "element-plus";

const isCollapse = inject("isCollapse");

// 编辑器实例，必须用 shallowRef，重要！
const editorRef = shallowRef();

const mode = ref("default");
// 内容 HTML
const valueHtml = ref("<p>更多帮助请查看官方文档</p>");
const toolbarConfig = {};
const editorConfig = { placeholder: "请输入内容..." };
// 组件销毁时，也及时销毁编辑器，重要！
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
// 编辑器回调函数
const handleCreated = (editor) => {
  console.log("created", editor);
  editorRef.value = editor; // 记录 editor 实例，重要！
};
const handleChange = (editor) => {
  console.log("change:", editor.getHtml());
};
const handleDestroyed = (editor) => {
  console.log("destroyed", editor);
};
const handleFocus = (editor) => {
  console.log("focus", editor);
};
const handleBlur = (editor) => {
  console.log("blur", editor);
};
const customAlert = (info, type) => {
  alert(`【自定义提示】${type} - ${info}`);
};
const customPaste = (editor, event, callback) => {
  console.log("ClipboardEvent 粘贴事件对象", event);
  // 自定义插入内容
  editor.insertText("xxx");
  // 返回值（注意，vue 事件的返回值，不能用 return）
  callback(false); // 返回 false ，阻止默认粘贴行为
  // callback(true) // 返回 true ，继续默认的粘贴行为
};

// 点击复制html标签
const copyHtml = () => {
  navigator.clipboard
    .writeText(valueHtml.value)
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
    <div class="text">
      富文本基于
      <el-link
        style="font-size: 14px"
        href="https://www.wangeditor.com/v5/getting-started.html"
        target="_blank"
        >wangeditor</el-link
      >
    </div>
    <div style="border: 1px solid #ccc; margin-top: 10px">
      <Toolbar
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
        style="border-bottom: 1px solid #ccc"
      />
      <Editor
        :defaultConfig="editorConfig"
        :mode="mode"
        v-model="valueHtml"
        style="height: 500px; overflow-y: hidden"
        @onCreated="handleCreated"
        @onChange="handleChange"
        @onDestroyed="handleDestroyed"
        @onFocus="handleFocus"
        @onBlur="handleBlur"
        @customAlert="customAlert"
        @customPaste="customPaste"
      />
    </div>
    <div style="margin-top: 10px">
      <el-link
        :underline="false"
        style="
          display: block;
          background-color: #eef1f6;
          height: 40px;
          line-height: 40px;
          margin-bottom: 10px;
          padding-left: 10px;
          box-sizing: border-box;
        "
        @click="copyHtml"
        >html标签</el-link
      >
      <textarea
        v-model="valueHtml"
        readonly
        style="
          width: 100%;
          height: 40px;
          outline: none;
          line-height: 40px;
          padding-left: 10px;
          box-sizing: border-box;
          border: 1px solid #ccc;
        "
      ></textarea>
    </div>
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
