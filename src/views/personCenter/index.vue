<script setup lang="ts">
import { inject, ref } from "vue";
import { useLoginStore } from "@/stores/LoginStore";
import {
  User,
  UserFilled,
  Phone,
  Message,
  Lock,
  OfficeBuilding,
  Refresh,
} from "@element-plus/icons-vue";
import {
  getUserLogAPI,
  sendVerifyCodeAPI,
  updateEmailAPI,
  updatePasswordAPI,
  updateUserByUserIdAPI,
} from "@/apis/user";
import { ElMessage } from "element-plus";

const isCollapse = inject("isCollapse", ref(false));

const loginStore = useLoginStore();
const userInfo = loginStore.userInfo;

const userForm = ref({
  nickName: userInfo.nickName,
  phone: userInfo.phone,
  gender: userInfo.gender,
});

const activeName = ref("information");

const queryParams = ref({
  page: 1,
  pageSize: 10,
  username: userInfo.username,
});

const load = ref(false);

const total = ref(1);
const tableData = ref([]);
const getUserLog = async () => {
  const res = await getUserLogAPI(queryParams.value);
  tableData.value = res.data.list;
  total.value = res.data.total;
};

const doGetUserLog = () => {
  if (activeName.value === "log") {
    load.value = true;
    setTimeout(() => {
      getUserLog();
      load.value = false;
    }, 1000);
  }
};

const handleSizeChange = () => {
  getUserLog();
};

const handleCurrentChange = () => {
  getUserLog();
};

// 修改用户信息表单规则
const rules = {
  nickName: [{ required: true, trigger: "blur", message: "昵称不能为空" }],
  phone: [
    {
      required: true,
      trigger: "blur",
      message: "手机号码不能为空",
    },
    {
      validator: (rule, value, callback) => {
        const phoneRegex = /^\d{11}$/;
        if (!phoneRegex.test(value)) {
          callback(new Error("手机号必须是11位数字"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const formRef = ref(null);
// 修改用户信息
const updateUserInfo = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      await updateUserByUserIdAPI(userInfo.id, userForm.value);
      // 修改pinia中User信息
      loginStore.updateUserInfo(userForm.value);
      ElMessage({ type: "success", message: "编辑成功" });
    }
  });
};

// 修改用户邮箱对话框可见性
const updateEmailDialogVisible = ref(false);
const updateEmailForm = ref({
  newEmail: "",
  verifyCode: "",
  password: "",
});

const emailRules = {
  newEmail: [
    { required: true, message: "请输入新邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
  ],
  verifyCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
  password: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
};
const emailForm = ref(null);
const codeLoading = ref(false);
const getVerifyCode = () => {
  emailForm.value.validateField("newEmail", async (valid) => {
    if (valid) {
      codeLoading.value = true;
      try {
        await sendVerifyCodeAPI(updateEmailForm.value.newEmail);
        ElMessage({ type: "success", message: "验证码已发送" });
      } catch (error) {
        ElMessage({ type: "error", message: "获取验证码失败" });
        throw error;
      } finally {
        codeLoading.value = false;
      }
    }
  });
};

// 修改邮箱
const updateEmail = () => {
  emailForm.value.validate(async (valid) => {
    if (valid) {
      await updateEmailAPI(updateEmailForm.value);
      loginStore.updateUserEmail(updateEmailForm.value.newEmail);
      ElMessage({ type: "success", message: "修改邮箱成功" });
      updateEmailDialogVisible.value = false;
    }
  });
};

// 修改密码对话框可见性
const updatePasswordDialogVisible = ref(false);

const updatePasswordForm = ref({
  usedPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwrodRules = {
  usedPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请再一次输入新密码", trigger: "blur" },
  ],
};
const passwordRef = ref(null);
const updatePassword = () => {
  if (
    updatePasswordForm.value.newPassword !==
    updatePasswordForm.value.confirmPassword
  ) {
    ElMessage({ type: "warning", message: "两次密码不一致" });
  }
  passwordRef.value.validate(async (valid) => {
    if (valid) {
      await updatePasswordAPI(updatePasswordForm.value);
      ElMessage({ type: "success", message: "修改密码成功" });
      updatePasswordDialogVisible.value = false;
    }
  });
};
</script>
<template>
  <div class="body" :class="{ left: isCollapse }">
    <div class="personal-info">
      <!-- 左侧信息栏 -->
      <div class="left-panel">
        <div class="title">个人信息</div>
        <div class="avatar-container">
          <el-avatar :size="100" src="path/to/totoro.jpg" />
        </div>

        <div class="info-list">
          <div class="info-item">
            <el-icon class="icon"><User /></el-icon>
            <span>登录账号</span>
            <span class="value">{{ userInfo.username }}</span>
          </div>

          <div class="info-item">
            <el-icon class="icon"><UserFilled /></el-icon>
            <span>用户昵称</span>
            <span class="value">{{ userInfo.nickName }}</span>
          </div>

          <div class="info-item">
            <el-icon class="icon"><OfficeBuilding /></el-icon>
            <span>所属部门</span>
            <span class="value">{{ userInfo.deptName }}</span>
          </div>

          <div class="info-item">
            <el-icon class="icon"><Phone /></el-icon>
            <span>手机号码</span>
            <span class="value">{{ userInfo.phone }}</span>
          </div>

          <div class="info-item">
            <el-icon class="icon"><Message /></el-icon>
            <span>用户邮箱</span>
            <span class="value">{{ userInfo.email }}</span>
          </div>

          <div class="info-item">
            <el-icon class="icon"><Lock /></el-icon>
            <span>安全设置</span>
            <div class="security-links">
              <el-link
                type="primary"
                class="link"
                @click="updatePasswordDialogVisible = true"
                :underline="false"
                >修改密码</el-link
              >
              <el-divider direction="vertical" />
              <el-link
                type="primary"
                class="link"
                @click="updateEmailDialogVisible = true"
                :underline="false"
              >
                修改邮箱
              </el-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧编辑区 -->
      <div class="right-panel">
        <el-tabs @tab-change="doGetUserLog" v-model="activeName">
          <el-tab-pane label="用户资料" name="information">
            <el-form
              :model="userForm"
              label-width="100px"
              :rules="rules"
              ref="formRef"
            >
              <el-form-item label="昵称" prop="nickName">
                <el-input v-model="userForm.nickName">
                  <template #append>
                    <span class="append-text">用户昵称不作为登录使用</span>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input v-model="userForm.phone">
                  <template #append>
                    <span class="append-text">手机号码不能重复</span>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="性别">
                <el-radio-group v-model="userForm.gender">
                  <el-radio label="男" value="男" />
                  <el-radio label="女" value="女" />
                </el-radio-group>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="updateUserInfo"
                  >保存配置</el-button
                >
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="操作日志" name="log">
            <div class="operation-log">
              <!-- 表格部分 -->
              <el-table :data="tableData" style="width: 100%" v-loading="load">
                <el-table-column
                  prop="description"
                  label="行为"
                  min-width="180"
                />
                <el-table-column prop="requestIp" label="IP" min-width="190" />
                <el-table-column
                  prop="address"
                  label="IP来源"
                  min-width="180"
                />
                <el-table-column
                  prop="browser"
                  label="浏览器"
                  min-width="180"
                />
                <el-table-column prop="time" label="请求耗时" min-width="250">
                  <template #default="{ row }">
                    <el-button
                      style="
                        background-color: #e9e9e9;
                        color: #212121;
                        width: 60px;
                        border: none;
                      "
                      >{{ row.time + "ms" }}</el-button
                    >
                  </template>
                </el-table-column>
                <el-table-column
                  prop="createTime"
                  label="创建日期"
                  min-width="180"
                />
                <el-table-column fixed="right" label="" width="80">
                  <template #header>
                    <el-icon style="cursor: pointer"><Refresh /></el-icon>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页部分 -->
              <div class="pagination-container" style="margin-top: 10px">
                <div class="pagination-content">
                  <el-pagination
                    v-model:current-page="queryParams.page"
                    v-model:page-size="queryParams.pageSize"
                    layout="total, prev, pager, next, sizes"
                    :total="total"
                    :page-sizes="[10, 20, 30, 50]"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                  />
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>

  <el-dialog
    title="修改邮箱"
    v-model="updateEmailDialogVisible"
    width="500px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :modal="true"
  >
    <el-form
      :model="updateEmailForm"
      :rules="emailRules"
      ref="emailForm"
      label-width="80px"
    >
      <el-form-item label="新邮箱" prop="newEmail">
        <el-row :gutter="10">
          <!-- gutter 设置列间距 -->
          <el-col :span="18">
            <el-input v-model="updateEmailForm.newEmail"></el-input>
          </el-col>
          <el-col :span="6">
            <el-button @click="getVerifyCode">获取验证码</el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="验证码" prop="verifyCode">
        <el-input v-model="updateEmailForm.verifyCode"></el-input>
      </el-form-item>

      <el-form-item label="当前密码" prop="password">
        <el-input v-model="updateEmailForm.password" type="password"></el-input>
      </el-form-item>
    </el-form>

    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="updateEmailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateEmail">确认</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    title="修改密码"
    v-model="updatePasswordDialogVisible"
    width="500px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :modal="true"
  >
    <el-form
      :model="updatePasswordForm"
      :rules="passwrodRules"
      ref="passwordRef"
      label-width="80px"
    >
      <el-form-item label="旧密码" prop="usedPassword">
        <el-input
          type="password"
          v-model="updatePasswordForm.usedPassword"
        ></el-input>
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="updatePasswordForm.newPassword"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="updatePasswordForm.confirmPassword"
          type="password"
        ></el-input>
      </el-form-item>
    </el-form>

    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="updatePasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updatePassword">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<style lang="scss">
// 定义变量
$primary-color: #409eff;
$text-color: #666;
$light-text: #999;
$border-radius: 4px;
$spacing-base: 24px;
$panel-bg: #fff;
.body {
  box-sizing: border-box;
  position: absolute;
  left: 199px;
  top: 80px;
  width: calc(100% - 199px);
  padding: 26px 32px;
  .personal-info {
    display: flex;
    gap: $spacing-base;
    align-items: flex-start; /* 子元素根据内容决定高度 */
    // 左侧面板
    .left-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: $panel-bg;
      border-radius: $border-radius;
      box-shadow: -2px 5px 20px rgba(0, 0, 0, 0.2);
      box-sizing: border-box;
      padding-bottom: 40px;
      .title {
        display: flex;
        justify-content: left;
        width: 100%;
        color: #303133;
        font-size: 16px;
        border-bottom: 1px solid #ebeef5;
        padding: 12px 0 12px 20px;
        box-sizing: border-box;
      }

      .avatar-container {
        display: flex;
        justify-content: center;
        margin-bottom: 25px;
      }

      .info-list {
        display: flex;
        flex-direction: column;
        padding: 0 20px;
        gap: 15px;
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 7px;
          box-sizing: border-box;
          border-bottom: 1px solid #ebeef5;
          span {
            font-size: 13px;
            color: #303133;
          }
          .icon {
            color: #a0a0a0;
          }
          .value {
            margin-left: auto;
            color: $text-color;
            font-size: 13px;
            color: #303133;
          }

          .security-links {
            margin-left: auto;
            .link {
              &:hover {
                border: none !important;
              }
            }
          }
        }
      }
    }

    // 右侧面板
    .right-panel {
      flex: 4;
      background: $panel-bg;
      padding: 9px 0 50px 20px;
      border-radius: $border-radius;
      box-shadow: -2px 5px 20px rgba(0, 0, 0, 0.2);
      box-sizing: border-box;
      // 表单样式
      .el-form {
        max-width: 600px;
        .el-form-item {
          margin-bottom: 22px;
          &__label {
            font-weight: normal;
          }
        }
        // 输入框后缀文字
        .append-text {
          color: $light-text;
          font-size: 12px;
          padding: 0 10px;
        }
      }
      // 标签页样式
      .el-tabs {
        .el-tabs__header {
          margin-bottom: $spacing-base;
        }

        .el-tabs__nav-wrap::after {
          height: 1px;
        }
      }
      // 按钮样式
      .el-button {
        padding: 8px 20px;
        &--primary {
          background-color: $primary-color;
        }
      }
    }
  }
}
.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
