<script setup lang="ts">
import { sendEmailAPI } from "@/apis/email";
import { ElMessage } from "element-plus";
import { inject, ref } from "vue";

const isCollapse = inject("isCollapse");

const form = ref({
  subject: "",
  to: "",
  text: "",
});

const emailRules = {
  subject: [{ required: true, trigger: "blur", message: "标题不能为空" }],
  to: [{ required: true, trigger: "blur", message: "收件人不能为空" }],
  text: [{ required: true, trigger: "blur", message: "正文不能为空" }],
};

const resetForm = () => {
  form.value.subject = "";
  form.value.text = "";
  form.value.to = "";
};

const emailForm = ref(null);
const sendEmail = () => {
  emailForm.value.validate(async (valid) => {
    if (valid) {
      await sendEmailAPI(form.value);
      ElMessage({ type: "success", message: "发送邮件成功" });
      setTimeout(() => {
        resetForm();
      }, 500);
    }
  });
};
</script>
<template>
  <div
    :class="['body', { left: isCollapse }]"
    style="transition: all 0.3s; z-index: 9; overflow: hidden"
  >
    <el-form
      :model="form"
      :rules="emailRules"
      ref="emailForm"
      label-width="80px"
      style="width: 700px"
    >
      <el-form-item label="邮件标题" prop="subject">
        <el-input v-model="form.subject"></el-input>
      </el-form-item>
      <el-form-item label="收件地址" prop="to">
        <el-input v-model="form.to"></el-input>
      </el-form-item>
      <el-form-item prop="text">
        <el-input
          v-model="form.text"
          :rows="10"
          type="textarea"
          placeholder="请输入正文"
        />
      </el-form-item>
      <el-form-item>
        <el-button class="email" @click="sendEmail">发送邮件</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<style lang="scss">
.body {
  box-sizing: border-box;
  position: absolute;
  left: 199px;
  top: 80px;
  width: calc(100% - 199px);
  padding: 26px 32px;
  .email {
    background-color: #212121;
    color: aliceblue;
    border: none;
    &:hover {
      background-color: #4d4d4d !important;
    }
  }
}
.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
