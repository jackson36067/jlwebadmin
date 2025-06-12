<script setup lang="ts">
import Background from "@/assets/images/girl.jpg";
import { useLoginStore } from "@/stores/LoginStore";
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import "element-plus/theme-chalk/el-message.css";
import router from "@/router";
import svgIcon from "@/components/svg/svgIcon.vue";
import { getCodeAPI } from "@/apis/login";
import { useDefaultActiveMenuStore } from "@/stores/DefaultActiveMenuStore";
import { initRoutes } from "@/router/initRoutes";
const loginForm = ref({
  username: "jackson",
  password: "123456",
  code: "",
});
const loginRef = ref<FormInstance>();
const loginRules = {
  username: [{ required: true, trigger: "blur", message: "用户名不能为空" }],
  password: [{ required: true, trigger: "blur", message: "密码不能为空" }],
  code: [{ required: true, trigger: "blur", message: "验证码不能为空" }],
};
// 验证码路径
const codeUrl = ref("");
const loginStore = useLoginStore();

const loading = ref(false);

const defaultActiveMenuStore = useDefaultActiveMenuStore();
const isAdmin = ref("1"); // 默认选中 Option 1

// 登录函数
const login = async () => {
  const { username, password, code } = loginForm.value;
  // 发起请求
  await loginStore
    .doUserLogin({
      username: username,
      password: password,
      code: code,
      isAdmin: isAdmin.value === "1" ? true : false,
    })
    .catch((error) => {
      // 如果登录出现错误刷新验证码
      getCode();
      // 清空验证码栏
      loginForm.value.code = "";
      return Promise.reject(error);
    });
  // 提示登录成功
  ElMessage({ type: "success", message: "登录成功" });
  // 动态加载路由
  await initRoutes(loginStore.userInfo.menuVOList);
  // 登录按钮键显示加载
  loading.value = true;
  setTimeout(() => {
    router.push(defaultActiveMenuStore.menuActive);
  }, 500);
};

const doLogin = () => {
  loginRef.value!.validate((valid) => {
    if (valid) {
      login();
    }
  });
};
const handleKeydown = (event) => {
  loginRef.value!.validate((valid) => {
    if (valid) {
      if (event.key === "Enter") {
        login();
      }
    }
  });
};
document.addEventListener("keydown", handleKeydown);

// 获取验证码接口
const getCode = async () => {
  const res = await getCodeAPI();
  // console.log(res.data);
  const blob = new Blob([res.data], { type: "image/png" });
  codeUrl.value = URL.createObjectURL(blob);
};
onMounted(() => {
  getCode();
});
</script>
<template>
  <div class="login">
    <img :src="Background" alt="" />
    <el-form
      ref="loginRef"
      :model="loginForm"
      :rules="loginRules"
      label-position="left"
      label-width="0px"
      class="login-form"
    >
      <h3 class="title">jackson 后台管理系统</h3>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          auto-complete="off"
          placeholder="账号"
        >
          <template v-slot:prefix>
            <svgIcon name="user" class="el-input input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
        >
          <template v-slot:prefix>
            <svgIcon name="password" class="el-input input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          v-model="loginForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
        >
          <template v-slot:prefix>
            <svg-icon name="validCode" class="el-input input-icon" />
          </template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" />
        </div>
      </el-form-item>
      <!-- <el-checkbox v-model="loginForm.rememberMe" style="margin: 0 0 25px 0">
        记住我
      </el-checkbox> -->
      <!-- 添加单选框, 选择身份 -->
      <div class="mb-2 ml-4">
        <el-radio-group v-model="isAdmin">
          <el-radio value="1" size="large">管理员</el-radio>
          <el-radio value="0" size="large">普通用户</el-radio>
        </el-radio-group>
      </div>
      <el-form-item style="width: 100%">
        <el-button
          :loading="loading"
          size="medium"
          type="primary"
          style="width: 100%"
          @click="doLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: center; /* 居中对齐 */
  align-items: center; /* 垂直居中对齐 */
  position: relative; /* 使容器可以相对定位 */
  width: 100%;
  height: 100%;
  img {
    width: 100%;
    height: 100%;
  }
}
.title {
  margin: 0 auto 30px auto;
  text-align: center;
  color: #707070;
}
.login-form {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 6px;
  background: #ffffff;
  width: 385px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
    margin-top: 23px;
  }
}
// .login-tip {
//   font-size: 13px;
//   text-align: center;
//   color: #bfbfbf;
// }
.login-code {
  width: 33%;
  display: inline-block;
  height: 38px;
  margin-left: 15px;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
</style>
