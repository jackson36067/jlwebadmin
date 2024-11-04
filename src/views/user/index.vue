<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { getDeptListAPI } from "@/apis/dept"; // 获取部门列表请求
import {
  Plus,
  Search,
  RefreshRight,
  EditPen,
  Delete,
  Download,
  Edit,
} from "@element-plus/icons-vue"; // 引入图标
import svgIcon from "@/components/svg/svgIcon.vue";
import {
  addUserAPI,
  deleteUserByUserIdAPI,
  getUserInfoByIdAPI,
  getUserListAPI,
  getUserListByDeptAPI,
  updateUserByUserIdAPI,
} from "@/apis/user"; // 获取用户列表请求
// 手动引入ElMesssageBox样式
import "element-plus/theme-chalk/el-message-box.css";
import { ElMessage, ElMessageBox, type DropdownInstance } from "element-plus"; // 弹窗
import { getEnabledJobListAPI } from "@/apis/job";
import { getRoleListAPI } from "@/apis/role";
import { fa } from "element-plus/es/locales.mjs";

// 是否折叠左侧菜单
const isCollapse = inject("isCollapse", ref(false));

// 封装生成tree数据函数
function transformData(data: any) {
  return data.map((item: any) => {
    return {
      value: item.id,
      label: item.name,
      children: item.subDeptVOList ? transformData(item.subDeptVOList) : [], // 递归转换子部门
    };
  });
}
// 获取部门数据
const transformedData = ref([]);
const dialogDeptData = ref([]);
const getDeptList = async () => {
  const res = await getDeptListAPI({});
  // 封装成tree所需的数据
  transformedData.value = transformData(res.data);
  dialogDeptData.value = transformData(res.data);
};

const form = ref({
  enabled: "",
  createTime: "",
});

// 封装请求条件
const queryParams = ref({
  page: 1,
  pageSize: 10,
  usernameOrEmail: "", // 绑定表单中的输入框
  begin: form.value.createTime[0],
  end: form.value.createTime[1],
  enabled: form.value.enabled,
});
const total = ref<number>(0);

// 组件加载自动请求获取用户数据
const userList = ref([]);
const getUserList = async () => {
  const res = await getUserListAPI(queryParams.value);
  // console.log(res.data);
  userList.value = res.data.list;
  total.value = res.data.total;
};
onMounted(() => {
  getUserList();
  getDeptList();
});

// 修改分页page-size(当前页码展示条数)时重新获取用户数据
const handleSizeChange = () => {
  getUserList();
};
// 修改分页current-page(当前页码)时重新获取用户数据
const handleCurrentChange = () => {
  getUserList();
};
// 点击搜索后发起请求获取用户列表数据
const queryUserList = () => {
  getUserList();
};

// 重置表单
function resetFields() {
  form.value.createTime = "";
  form.value.enabled = "";
  queryParams.value.usernameOrEmail = "";
  getUserList();
}
const doReset = () => {
  resetFields();
};

// 每个tree所对应的值(部门id),可通过其发送请求获取相关部门下的用户
const value = ref();
const getUserListByDeptId = async () => {
  const res = await getUserListByDeptAPI(value.value);
  userList.value = res.data;
};

// 日期所需快速选择器
const shortcuts = [
  {
    text: "Last week",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "Last month",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: "Last 3 months",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

// 是否展示.query
const showQuery = ref(true);
const isShowQuery = () => {
  showQuery.value = showQuery.value === true ? false : true;
};

// 点击刷新按钮刷新用户信息
const loading = ref(false);
const refreshUserInfo = () => {
  loading.value = true;
  setTimeout(() => {
    getUserList();
    loading.value = false;
  }, 2000);
};

// 修改状态
// 封装更新用户信息的对象
const updateUserObject = ref({
  enabled: true,
});
const changeUserEnabled = (row) => {
  ElMessageBox.confirm(
    row.enabled === true
      ? '此操作将 "启用" test, 是否继续？'
      : '此操作将 "禁用" test, 是否继续？',
    "Warning",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      // 修改用户状态
      // console.log(row.enabled);
      updateUserObject.value.enabled = row.enabled;
      await updateUserByUserIdAPI(row.id, updateUserObject.value);
      // 修改成功后刷新页面
      getUserList();
      ElMessage({
        type: "success",
        message: "修改成功",
      });
    })
    .catch(() => {
      // 取消修改也要刷新页面
      getUserList();
      ElMessage({
        type: "info",
        message: "取消修改",
      });
    });
};

// 获取所有激活的岗位列表
const enabledJob = ref([]);
const getEnabledJobList = async () => {
  const res = await getEnabledJobListAPI();
  enabledJob.value = res.data;
};

// 获取所有角色列表
const roleList = ref([]);
const getRoleList = async () => {
  const res = await getRoleListAPI();
  roleList.value = res.data;
};

// 新增弹出对话框可见性控制变量
const dialogAddTableVisible = ref(false);

// 点击新增用户,不是真的新增用户
const doAddUser = () => {
  // 展示弹窗
  dialogAddTableVisible.value = true;
  // 获取激活的岗位列表
  getEnabledJobList();
  // 获取角色列表
  getRoleList();
};

// 弹出对话框中的form表单
const dialogAddForm = ref({
  username: "",
  phone: "",
  nickName: "",
  email: "",
  deptId: "",
  gender: "男",
  enabled: false,
  jobs: [],
  roles: [],
});

// dialog-form表单校验
const rules = {
  username: [{ required: true, trigger: "blur", message: "用户名不能为空" }],
  phone: [
    {
      required: true,
      type: "Number",
      trigger: "blur",
      message: "电话号码不能为空",
    },
  ],
  nickName: [{ required: true, trigger: "blur", message: "昵称不能为空" }],
  email: [{ required: true, trigger: "blur", message: "邮箱不能为空" }],
};
const dialogAddUserFormRef = ref(null);
// 新增用户
const addUser = () => {
  dialogAddUserFormRef.value.validate(async (valid) => {
    if (valid) {
      // 发起新增用户请求
      await addUserAPI(dialogAddForm.value);
      // 关闭dialog
      dialogAddTableVisible.value = false;
      // 刷新页面
      getUserList();
      // 提示添加成功
      ElMessage({ type: "success", message: "新增成功" });
    }
  });
};

// 通过用户id获取用户信息
const dialogUpdateForm = ref({
  id: "",
  username: "",
  phone: "",
  nickName: "",
  email: "",
  deptId: "",
  gender: "男",
  enabled: false,
  jobs: [],
  roles: [],
});

// 新增员工弹窗确认后修改员工
const dialogUpdateTableVisible = ref(false);
const getUserInfoById = async (id: string) => {
  // 发起请求获取用户信息
  const res = await getUserInfoByIdAPI(id);
  // 获取激活的岗位列表
  getEnabledJobList();
  // 获取角色列表
  getRoleList();
  // 赋值给弹窗中的表格数据
  dialogUpdateForm.value = res.data;
  // 显示表格
  dialogUpdateTableVisible.value = true;
};

// 修改员工弹窗确认后修改员工
const dialogUpdateUserFormRef = ref(null);

/**
 * 修改用户
 */
const updateUser = () => {
  dialogUpdateUserFormRef.value.validate(async (valid) => {
    if (valid) {
      // 执行修改操作
      await updateUserByUserIdAPI(
        dialogUpdateForm.value.id,
        dialogUpdateForm.value
      );
      // 将弹窗关闭
      dialogUpdateTableVisible.value = false;
      ElMessage({ type: "success", message: "修改成功" });
      // 刷新页面
      getUserList();
    }
  });
};

/**
 * 删除用户
 */
const deleteIds: Array<string> = [];
const deleteUserByUserId = (row: object) => {
  ElMessageBox.confirm(
    `此操作将删除用户 ${row.username}, 是否继续？`,
    "Warning",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      // 删除用户
      deleteIds.push(row.id);
      await deleteUserByUserIdAPI(deleteIds);
      // 修改成功后刷新页面
      getUserList();
      ElMessage({
        type: "success",
        message: "删除成功",
      });
    })
    .catch(() => {
      // 取消修改也要刷新页面
      // getUserList();
      ElMessage({
        type: "info",
        message: "取消删除",
      });
    });
};

// 控制修改以及删除以及重置密码按钮是否可用
const buttonDisabled = ref<boolean>(true);
// 获取表格多选框选中的内容
const selectionUserInfo = ref<Array<object>>([]);
// 有选中的用户选项让修改以及删除以及重置密码按钮可用

const handleSelectionChange = (val: Array<object>) => {
  selectionUserInfo.value = val;
  if (selectionUserInfo.value.length >= 1) {
    buttonDisabled.value = false;
  } else {
    buttonDisabled.value = true;
  }
};

// 根据表格中选中的用户进行删除
const selectionUserIds = ref<Array<string>>([]);
const selectionDeleteUser = async () => {
  ElMessageBox.confirm(`此操作将删除这些用户 , 是否继续？`, "Warning", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      selectionUserInfo.value.forEach((item: object) => {
        selectionUserIds.value.push(item.id);
      });
      // 删除用户
      await deleteUserByUserIdAPI(selectionUserIds.value);
      // 修改成功后刷新页面
      getUserList();
      ElMessage({
        type: "success",
        message: "删除成功",
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消删除",
      });
    });
};

// 修改表格中多选框选中的用户 -> 注意只能选择一个
const selectionUpdateUser = () => {
  // 判断多选框是否只选中一个
  if (selectionUserInfo.value.length > 1) {
    ElMessage({ type: "warning", message: "请选中一个用户进行修改" });
    return;
  }
  // 通过被选中的用户id获取该用户数据
  getUserInfoById(selectionUserInfo.value[0].id);
  // 获取所有角色以及岗位
  // 将表格展示出来
  dialogUpdateTableVisible.value = true;
};
</script>
<template>
  <div class="body" :class="{ left: isCollapse }">
    <div class="main">
      <div class="dept">
        <el-tree-select
          v-model="value"
          :data="transformedData"
          filterable
          class="tree"
          @change="getUserListByDeptId"
          placeholder="请选择"
          :check-strictly="true"
        />
        <el-divider />
        <div class="text">请 选 择 部 门</div>
      </div>
      <div class="user">
        <div class="query" v-if="showQuery">
          <el-form
            :model="form"
            style="max-width: 100%"
            :resetFields="resetFields"
          >
            <el-form-item class="form-item">
              <el-input
                v-model="queryParams.usernameOrEmail"
                placeholder="输入名称或者邮箱搜索"
                style="width: 210px"
              />
            </el-form-item>
            <el-form-item style="margin: 0 10px" class="form-item">
              <div class="demo-date-picker">
                <div class="block">
                  <el-date-picker
                    v-model="form.createTime"
                    type="daterange"
                    unlink-panels
                    range-separator=":"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :shortcuts="shortcuts"
                    style="width: 200px"
                  />
                </div>
              </div>
            </el-form-item>
            <el-form-item class="form-item">
              <el-select
                v-model="form.enabled"
                placeholder="状态"
                style="width: 90px"
              >
                <el-option label="激活" :value="true" />
                <el-option label="锁定" :value="false" />
              </el-select>
            </el-form-item>
            <el-form-item class="form-item">
              <el-button
                :icon="Search"
                style="margin: 0 10px"
                type="success"
                @click="queryUserList"
              >
                搜索
              </el-button>
            </el-form-item>
            <el-form-item class="form-item">
              <el-button :icon="RefreshRight" type="warning" @click="doReset"
                >重置</el-button
              >
            </el-form-item>
          </el-form>
        </div>
        <div class="button">
          <div class="operate">
            <el-button
              :icon="Plus"
              style="background-color: #000; color: #fff; font-size: 12px"
              @click="doAddUser"
            >
              新增
            </el-button>

            <el-button
              type="success"
              :icon="EditPen"
              style="font-size: 12px"
              @click="selectionUpdateUser"
              :disabled="buttonDisabled"
            >
              修改
            </el-button>
            <el-button
              type="danger"
              :icon="Delete"
              style="font-size: 12px"
              @click="selectionDeleteUser"
              :disabled="buttonDisabled"
            >
              删除
            </el-button>
            <el-button type="warning" :icon="Download" style="font-size: 12px">
              导出
            </el-button>
            <el-button
              type="info"
              :icon="RefreshRight"
              style="font-size: 12px"
              :disabled="buttonDisabled"
            >
              重置密码
            </el-button>
          </div>
          <div class="box">
            <span @click="isShowQuery" :class="{ changeBGC: !showQuery }">
              <svgIcon
                name="search"
                color="#c0c4cc"
                class="svg-icon"
                width="12px"
                height="12px"
                :class="{ changeColor: !showQuery }"
              />
            </span>
            <span @click="refreshUserInfo">
              <svgIcon name="refresh" width="12px" height="12px" />
            </span>
            <span>
              <svgIcon name="grid" width="12px" height="12px" />
            </span>
          </div>
        </div>
        <div class="table">
          <el-table
            :data="userList"
            style="width: 100%"
            show-overflow-tooltip
            v-loading="loading"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column
              fixed
              prop="username"
              label="用户名"
              width="150"
              align="center"
            />
            <el-table-column
              prop="nickName"
              label="昵称"
              width="120"
              align="center"
            />
            <el-table-column
              prop="gender"
              label="性别"
              width="120"
              align="center"
            />
            <el-table-column
              prop="phone"
              label="电话"
              width="160"
              align="center"
            />
            <el-table-column
              prop="email"
              label="邮箱"
              width="160"
              align="center"
            />
            <el-table-column
              prop="deptName"
              label="部门"
              width="120"
              align="center"
            />
            <el-table-column
              prop="enabled"
              label="状态"
              min-width="80"
              width="100"
            >
              <template #default="{ row }">
                <el-switch
                  v-model="row.enabled"
                  class="ml-2"
                  style="
                    --el-switch-on-color: #409eff;
                    --el-switch-off-color: #ff4949;
                  "
                  @change="changeUserEnabled(row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              width="200"
              align="center"
            />
            <el-table-column label="Operations" min-width="120">
              <template #default="{ row }">
                <el-button
                  type="warning"
                  :icon="Edit"
                  circle
                  @click="getUserInfoById(row.id)"
                />
                <el-button
                  type="danger"
                  :icon="Delete"
                  @click="deleteUserByUserId(row)"
                  circle
                />
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            style="margin-top: 20px"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[5, 10, 30, 50, 100]"
            layout="total, prev, pager, next, sizes"
            :total="total"
            v-model:current-page="queryParams.page"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
  <el-dialog
    v-model="dialogAddTableVisible"
    title="新增用户"
    width="568"
    :destroy-on-close="true"
    :modal="true"
    :close-on-click-modal="false"
  >
    <el-form
      :inline="true"
      :model="dialogAddForm"
      label-width="80px"
      :rules="rules"
      ref="dialogAddUserFormRef"
    >
      <el-form-item label="用户名" style="width: 40%" prop="username">
        <el-input v-model="dialogAddForm.username" />
      </el-form-item>
      <el-form-item
        label="电话"
        style="width: 40%; margin-left: 15px"
        prop="phone"
      >
        <el-input v-model="dialogAddForm.phone" />
      </el-form-item>
      <el-form-item label="昵称" style="width: 40%" prop="nickName">
        <el-input v-model="dialogAddForm.nickName" />
      </el-form-item>
      <el-form-item
        label="邮箱"
        style="width: 40%; margin-left: 15px"
        prop="email"
      >
        <el-input v-model="dialogAddForm.email" />
      </el-form-item>
    </el-form>
    <el-form-item
      label="部门"
      style="width: 40%; margin-left: 40px; float: left"
    >
      <el-tree-select
        v-model="dialogAddForm.deptId"
        :data="dialogDeptData"
        filterable
        placeholder="选择部门"
        :check-strictly="true"
        style="width: 89%"
      />
    </el-form-item>
    <el-form-item
      label="岗位"
      style="width: 40%; margin-right: 22px; float: right"
    >
      <el-select
        v-model="dialogAddForm.jobs"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="2"
        placeholder="请选择"
        style="width: 89%"
      >
        <el-option
          v-for="job in enabledJob"
          :key="job.id"
          :label="job.name"
          :value="job.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="性别" style="width: 40%; margin-left: 40px">
      <el-radio-group v-model="dialogAddForm.gender">
        <el-radio value="男">男</el-radio>
        <el-radio value="女">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="性别" style="width: 40%; margin-left: 40px">
      <el-radio-group v-model="dialogAddForm.enabled">
        <el-radio :value="true">激活</el-radio>
        <el-radio :value="false">禁用</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="角色" style="width: 95%; margin-left: 40px">
      <el-select
        v-model="dialogAddForm.roles"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="1"
        placeholder="请选择"
        style="width: 89%"
      >
        <el-option
          v-for="role in roleList"
          :key="role.id"
          :label="role.name"
          :value="role.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item style="margin: 10px 0 0 200px">
      <el-button link @click="dialogAddTableVisible = false"> 取消 </el-button>
      <el-button
        type="success"
        @click="addUser"
        style="background-color: #000; color: #fff; border: none"
        >确认</el-button
      >
    </el-form-item>
  </el-dialog>
  <el-dialog
    v-model="dialogUpdateTableVisible"
    title="新增用户"
    width="568"
    :destroy-on-close="true"
    :modal="true"
    :close-on-click-modal="false"
  >
    <el-form
      :inline="true"
      :model="dialogUpdateForm"
      label-width="80px"
      :rules="rules"
      ref="dialogUpdateUserFormRef"
    >
      <el-form-item label="用户名" style="width: 40%" prop="username">
        <el-input v-model="dialogUpdateForm.username" />
      </el-form-item>
      <el-form-item
        label="电话"
        style="width: 40%; margin-left: 15px"
        prop="phone"
      >
        <el-input v-model="dialogUpdateForm.phone" />
      </el-form-item>
      <el-form-item label="昵称" style="width: 40%" prop="nickName">
        <el-input v-model="dialogUpdateForm.nickName" />
      </el-form-item>
      <el-form-item
        label="邮箱"
        style="width: 40%; margin-left: 15px"
        prop="email"
      >
        <el-input v-model="dialogUpdateForm.email" />
      </el-form-item>
    </el-form>
    <el-form-item
      label="部门"
      style="width: 40%; margin-left: 40px; float: left"
    >
      <el-tree-select
        v-model="dialogUpdateForm.deptId"
        :data="dialogDeptData"
        filterable
        placeholder="选择部门"
        :check-strictly="true"
        style="width: 89%"
      />
    </el-form-item>
    <el-form-item
      label="岗位"
      style="width: 40%; margin-right: 22px; float: right"
    >
      <el-select
        v-model="dialogUpdateForm.jobs"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="1"
        placeholder="请选择"
        style="width: 89%"
      >
        <el-option
          v-for="job in enabledJob"
          :key="job.id"
          :label="job.name"
          :value="job.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="性别" style="width: 40%; margin-left: 40px">
      <el-radio-group v-model="dialogUpdateForm.gender">
        <el-radio value="男">男</el-radio>
        <el-radio value="女">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="性别" style="width: 40%; margin-left: 40px">
      <el-radio-group v-model="dialogUpdateForm.enabled">
        <el-radio :value="true">激活</el-radio>
        <el-radio :value="false">禁用</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="角色" style="width: 95%; margin-left: 40px">
      <el-select
        v-model="dialogUpdateForm.roles"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="3"
        placeholder="请选择"
        style="width: 89%"
      >
        <el-option
          v-for="role in roleList"
          :key="role.id"
          :label="role.name"
          :value="role.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item style="margin: 10px 0 0 200px">
      <el-button link @click="dialogUpdateTableVisible = false">
        取消
      </el-button>
      <el-button
        type="success"
        @click="updateUser"
        style="background-color: #000; color: #fff; border: none"
        >确认</el-button
      >
    </el-form-item>
  </el-dialog>
</template>
<style scoped lang="scss">
.body {
  box-sizing: border-box;
  position: absolute;
  left: 199px;
  top: 80px;
  width: calc(100% - 199px);
  padding: 26px 32px;
  .main {
    display: flex;
    .dept {
      flex: 1;
      .text {
        text-align: center;
        font-size: 14px;
        color: #c0c4cc;
        font-weight: 700;
        text-shadow: 1px 1px;
      }
      .tree {
        width: 100%;
      }
    }
    .user {
      display: flex;
      flex-direction: column;
      flex: 5;
      margin-left: 40px;
      .query {
        display: block;
        .form-item {
          float: left;
        }
      }
      .button {
        .operate {
          float: left;
        }
        .box {
          box-sizing: border-box;
          display: flex;
          width: 134px;
          height: 29px;
          float: right;
          border: 1px solid #c0c4cc;
          cursor: pointer;
          span {
            flex: 1;
            text-align: center;
            line-height: 29px;
            &:nth-child(n + 2) {
              border-left: 1px solid #c0c4cc;
            }
            &:first-child {
              background-color: #f4f4f5;
            }
            &:first-child :hover {
              background-color: #909399;
            }
            &:first-child :hover .svg-icon {
              color: #fff;
            }
            &:nth-child(n + 2):hover {
              background-color: #e9e9e9;
            }
            .changeColor {
              color: #fff;
            }
          }
          .changeBGC {
            background-color: #909399;
          }
        }
      }
      .table {
        margin-top: 30px;
      }
    }
  }
}
.demo-pagination-block + .demo-pagination-block {
  margin-top: 10px;
}
.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}
.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
