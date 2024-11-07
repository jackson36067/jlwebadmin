<script setup lang="ts">
import { ref, inject, onMounted, computed } from "vue";
import {
  Plus,
  Search,
  RefreshRight,
  EditPen,
  Delete,
  Download,
  Edit,
} from "@element-plus/icons-vue"; // 引入图标
import {
  addRoleAPI,
  deleteRoleByIdsAPI,
  exportRoleDataAPI,
  getRoleWithPagingAPI,
  updateRoleAPI,
  updateRoleMenuAPI,
} from "@/apis/role";
import { getMenuListAPI } from "@/apis/menu";
import { useLoginStore } from "@/stores/LoginStore";
import { formatDateToString, formatLocalDateTime } from "@/utils/dateFormat";
import { ElMessage, ElMessageBox } from "element-plus";

interface Tree {
  label: string;
  children?: Tree[];
}

// 是否折叠左侧菜单
const isCollapse = inject("isCollapse", ref(false));

const form = ref({
  nameOrDescription: "",
  createTime: "",
});

// 将date-select选择的日期转换成'yyyy-MM-dd HH:mm:ss'
function formatDateForBackend(date) {
  if (!date) return null;
  return date.toISOString().slice(0, 19); // 将 ISO 格式转换为 'yyyy-MM-dd HH:mm:ss'
}

// 封装请求条件
const queryParams = computed(() => ({
  page: 1,
  pageSize: 10,
  nameOrDescription: form.value.nameOrDescription,
  begin: formatDateForBackend(form.value.createTime[0]) || null, // 默认值为 null
  end: formatDateForBackend(form.value.createTime[1]) || null, // 默认值为 null
}));

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

// 表格数据
const roleList = ref<Array<object>>([]);
const getRoleList = async () => {
  const res = await getRoleWithPagingAPI(queryParams.value);
  roleList.value = res.data.list;
  roleList.value.forEach((item) => {
    item.createTime = formatLocalDateTime(item.createTime);
  });
};
onMounted(() => {
  getRoleList();
});

// 点击搜索按钮根据条件搜索角色信息
const queryRoleList = () => {
  queryParams.value.begin = formatDateForBackend(form.value.createTime[0]);
  queryParams.value.end = formatDateForBackend(form.value.createTime[1]);
  console.log(form.value);
  console.log(queryParams.value);
  getRoleList();
};
// 重置表单
function resetFields() {
  form.value.createTime = "";
  form.value.nameOrDescription = "";
  // 重新获取role数据
  getRoleList();
}

// 点击重置按钮后将数据重置
const doReset = () => {
  resetFields();
};

// 是否展示.query
const showQuery = ref(true);
const isShowQuery = () => {
  showQuery.value = showQuery.value === true ? false : true;
};

// 点击刷新按钮刷新角色信息
const loading = ref(false);
const refreshUserInfo = () => {
  loading.value = true;
  setTimeout(() => {
    // 重新获取角色数据
    getRoleList();
    loading.value = false;
  }, 2000);
};

// 将得到的菜单改成Tree展示所需类型
const formatMenuListData = (data: Array<object>) => {
  return data.map((item: any) => {
    return {
      id: item.id,
      label: item.title,
      children: item.menuListVOList
        ? formatMenuListData(item.menuListVOList)
        : [], // 递归转换子部门
    };
  });
};

// 右侧菜单栏获取
const menuList = ref<Array<object>>([]);
const menuData = ref<Tree[]>([]);
const getMenuList = async () => {
  const res = await getMenuListAPI({});
  menuList.value = res.data;
  // 菜单栏tree展示
  menuData.value = formatMenuListData(menuList.value);
  // 新增栏权限选择
  permissionData.value = formatMenuListData(menuList.value);
};
const defaultProps = {
  children: "children",
  label: "label",
};
onMounted(() => {
  getMenuList();
});

// 保存按钮可用性
const saveButton = ref(true);
//保存被点击的角色id
const roleId = ref("");
// 当点击表格中的单元格时配置默认要选中的菜单
// treeref
const treeRef = ref(null);
const rowClick = (role) => {
  treeRef.value.setCheckedKeys(role.menuIdList, false);
  saveButton.value = false;
  roleId.value = role.id;
};

// 保存该角色的菜单

// 保存角色菜单请求参数
const updateRoleMenu = ref({
  id: "",
  menuIdList: [],
});

// 最终被选中的菜单id数组
const selectionMenuIdList = ref([]);
const saveRoleMenuList = async () => {
  const selectionMenuList = treeRef.value.getCheckedNodes();
  selectionMenuList.forEach((item) => {
    selectionMenuIdList.value.push(item.id);
  });
  updateRoleMenu.value.id = roleId.value;
  updateRoleMenu.value.menuIdList = selectionMenuIdList.value;
  await updateRoleMenuAPI(updateRoleMenu.value);
  ElMessage({ type: "success", message: "保存成功" });
};

// 数据权限数据封装(select-tree)
const permissionData = ref({});

// 新增角色对话框显示
const dialogAddVisible = ref<boolean>(false);

// 封装新增角色参数对象
const addRoleParams = ref({
  name: "",
  level: 3,
  dataScope: "全部",
  permissionList: [],
  description: "",
});

// 弹窗表格dom对象
const addDialogFormRef = ref(null);

// 弹窗表格鉴定规则
const rules = {
  name: [{ required: true, trigger: "blur", message: "角色名称不能为空" }],
  description: [{ required: true, trigger: "blur", message: "描述不能为空" }],
};

// 权限选择树dom元素
const permissionSelectRef = ref(null);

// 新增用户
const doAddRole = () => {
  addDialogFormRef.value.validate(async (valid) => {
    if (valid) {
      // 保存选择的权限的id
      const selectPermissionIdList = ref([]);
      if (addRoleParams.value.dataScope === "自定义") {
        // 获取自定义时选择的菜单(得到菜单的id数组)
        if (permissionSelectRef.value.getCheckedNodes() !== null) {
          const permissionNodes = permissionSelectRef.value.getCheckedNodes();
          permissionNodes.forEach((element: object) => {
            selectPermissionIdList.value.push(element.id);
          });
        }
        // 封装条件
        addRoleParams.value.permissionList = selectPermissionIdList.value;
      }
      // 发起新增用户请求
      await addRoleAPI(addRoleParams.value);
      // 刷新页面
      getRoleList();
      // 关闭dialog
      dialogAddVisible.value = false;
      // 提示添加成功
      ElMessage({ type: "success", message: "新增成功" });
    }
  });
};

// 修改角色按钮可用性
const updateButtonDisabled = ref<boolean>(true);
// 删除按钮的可用性
const deleteButtonDisabled = ref<boolean>(true);

// 封装修改角色参数
const updateRoleParams = ref({
  id: "",
  name: "",
  level: 3,
  dataScope: "全部",
  permissionList: [],
  description: "",
});

// 修改角色弹窗是否可见
const dialogUpdateVisible = ref<boolean>(false);

// 修改treedom元素
const updatePermissionSelectRef = ref(null);

// 封装被选中的行id集合
const deleteRoleIds = ref<Array<string>>([]);

// 当复选框发生变化时触发该函数
const handleSelectionChange = (val: Array<object>) => {
  updateButtonDisabled.value = true;
  // 如果只选中一个那么就可以使用修改
  if (val.length == 1) {
    updateButtonDisabled.value = false;
    // 封装角色原本内容
    updateRoleParams.value.id = val[0].id;
    updateRoleParams.value.name = val[0].name;
    updateRoleParams.value.level = val[0].level;
    updateRoleParams.value.dataScope = val[0].dataScope;
    updateRoleParams.value.description = val[0].description;
    updateRoleParams.value.permissionList = val[0].menuIdList;
  }
  // 只要有选中就解放删除按钮
  if (val.length >= 1) {
    deleteButtonDisabled.value = false;
  }
  // 保存复选框选中的行的id
  // 复选框每次发生变化时先初始化删除id值,防止id重复
  deleteRoleIds.value = [];
  val.forEach((item) => {
    deleteRoleIds.value.push(item.id);
  });
  console.log(deleteRoleIds.value);
};

// 修改角色前的数据准备
const updateRole = () => {
  dialogUpdateVisible.value = true;
};

const updateDialogFormRef = ref(null);

// 修改角色
const doUpdateRole = () => {
  updateDialogFormRef.value.validate(async (valid) => {
    if (valid) {
      // 保存选择的权限的id
      const selectPermissionIdList = ref([]);
      // 获取自定义时选择的菜单(得到菜单的id数组)
      if (updateRoleParams.value.dataScope === "自定义") {
        if (updatePermissionSelectRef.value.getCheckedNodes() !== null) {
          const permissionNodes =
            updatePermissionSelectRef.value.getCheckedNodes();
          permissionNodes.forEach((element: object) => {
            selectPermissionIdList.value.push(element.id);
          });
        }
        // 封装条件
        updateRoleParams.value.permissionList = selectPermissionIdList.value;
      }
      // 发起新增用户请求
      await updateRoleAPI(updateRoleParams.value);
      // 刷新页面
      getRoleList();
      // 关闭dialog
      dialogUpdateVisible.value = false;
      // 提示添加成功
      ElMessage({ type: "success", message: "修改成功" });
    }
  });
};

// 修改行(每个行旁边的修改按钮)
const updateRoleRow = (row) => {
  // 让弹窗可见
  dialogUpdateVisible.value = true;
  // 封装参数
  updateRoleParams.value.id = row.id;
  updateRoleParams.value.name = row.name;
  updateRoleParams.value.level = row.level;
  updateRoleParams.value.dataScope = row.dataScope;
  updateRoleParams.value.description = row.description;
  updateRoleParams.value.permissionList = row.menuIdList;
};

// 导出角色数据
const exportRoleData = async () => {
  await exportRoleDataAPI()
    .then((data) => {
      // console.log(data);
      if (!data) {
        return;
      }
      const url = window.URL.createObjectURL(
        new Blob([data], { type: "application/vnd.ms-excel;charset=utf8" })
      );
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      // 设置年份
      const date = new Date();
      const dateFormat = formatDateToString(date);
      // 下载文件
      link.setAttribute("download", `${dateFormat}角色数据` + ".xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); //下载完成移除元素
      window.URL.revokeObjectURL(url); //释放掉blob对象
      ElMessage({ type: "success", message: "导出成功" });
    })
    .catch((error) => {
      console.error("下载错误:", error);
    });
};

// 删除角色

const deleteRole = () => {
  ElMessageBox.confirm(`此操作将删除该角色吗 , 是否继续？`, "Warning", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await deleteRoleByIdsAPI(deleteRoleIds.value);
      ElMessage({ type: "success", message: "删除成功" });
      // 刷新页面
      getRoleList();
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消删除",
      });
    });
};

const deleteRoleByIds = async () => {
  console.log(deleteRoleIds.value.length);
  if (deleteRoleIds.value.length < 1) {
    ElMessage({ type: "warning", message: "请选择要删除的角色" });
    return;
  }
  deleteRole();
};

// 通过删除按钮删除角色(每一行旁边的删除按钮)
const deleteRoleRow = async (id: string) => {
  // 先重置保存删除id的数组,防止删除复选框选中的角色
  deleteRoleIds.value = [];
  // 在赋值该行的id给保存删除id的数组
  deleteRoleIds.value.push(id);
  deleteRole();
};
</script>
<template>
  <div class="body" :class="{ left: isCollapse }">
    <div class="main">
      <div class="query" v-if="showQuery">
        <el-form
          :model="form"
          style="max-width: 100%"
          :resetFields="resetFields"
        >
          <el-form-item class="form-item">
            <el-input
              v-model="form.nameOrDescription"
              placeholder="输入名称或者描述搜索"
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
            <el-button
              :icon="Search"
              style="margin: 0 10px"
              type="success"
              @click="queryRoleList"
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
            @click="dialogAddVisible = true"
          >
            新增
          </el-button>

          <el-button
            type="success"
            :icon="EditPen"
            style="font-size: 12px"
            :disabled="updateButtonDisabled"
            @click="updateRole"
          >
            修改
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            style="font-size: 12px"
            :disabled="deleteButtonDisabled"
            @click="deleteRoleByIds"
          >
            删除
          </el-button>
          <el-button
            type="warning"
            :icon="Download"
            style="font-size: 12px"
            @click="exportRoleData"
          >
            导出
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
      <div class="role">
        <div class="table">
          <div class="list">角色列表</div>
          <el-table
            :data="roleList"
            border
            style="width: 100%"
            show-overflow-tooltip
            v-loading="loading"
            stripe
            @row-click="rowClick"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column
              fixed
              prop="name"
              label="名称"
              width="150"
              align="center"
            />
            <el-table-column
              prop="dataScope"
              label="数据权限"
              width="120"
              align="center"
            />
            <el-table-column
              prop="level"
              label="角色级别"
              width="160"
              align="center"
            />
            <el-table-column
              prop="description"
              label="描述"
              width="300"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              prop="createTime"
              label="创建时间"
              width="250"
              align="center"
            />
            <el-table-column label="操作" min-width="100" align="center">
              <template #default="{ row }">
                <el-button
                  type="warning"
                  :icon="Edit"
                  circle
                  @click="updateRoleRow(row)"
                />
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  @click="deleteRoleRow(row.id)"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="assignment-role">
          <div class="list">
            <el-popover
              placement="top-start"
              :width="200"
              trigger="hover"
              content="选择指定角色分配菜单"
              popper-style="background-color:#000; font-size: 12px"
            >
              <template #reference>
                <span>菜单分配</span>
              </template>
            </el-popover>
            <el-button
              type="info"
              :disabled="saveButton"
              @click="saveRoleMenuList"
            >
              保存
            </el-button>
          </div>
          <div class="menu">
            <el-tree
              ref="treeRef"
              style="max-width: 600px; padding: 10px 20px; color: #000"
              :data="menuData"
              show-checkbox
              draggable
              node-key="id"
              accordion
              :props="defaultProps"
              :check-strictly="true"
              :check-on-click-node="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 新增角色对话框 -->
  <el-dialog
    v-model="dialogAddVisible"
    title="新增角色"
    width="500"
    :destroy-on-close="true"
    :modal="true"
    :close-on-click-modal="false"
  >
    <el-form
      label-width="80px"
      :inline="true"
      ref="addDialogFormRef"
      :rules="rules"
      :model="addRoleParams"
    >
      <el-form-item
        label="角色名称"
        style="width: 95%; margin-top: 10px"
        prop="name"
      >
        <el-input v-model="addRoleParams.name"></el-input>
      </el-form-item>
      <el-form-item label="角色等级" style="width: 43%">
        <el-input-number
          v-model="addRoleParams.level"
          class="mx-4"
          :min="1"
          :max="10"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="数据范围" style="width: 43%">
        <el-select v-model="addRoleParams.dataScope" style="width: 100%">
          <el-option label="全部" value="全部" />
          <el-option label="本级" value="本级" />
          <el-option label="自定义" value="自定义" />
        </el-select>
      </el-form-item>
      <el-form-item
        label="数据权限"
        style="width: 95%"
        v-if="addRoleParams.dataScope === '自定义'"
      >
        <el-tree-select
          ref="permissionSelectRef"
          v-model="addRoleParams.permissionList"
          :data="permissionData"
          check-strictly
          :render-after-expand="false"
          show-checkbox
          style="width: 100%"
          multiple
          node-key="id"
        />
      </el-form-item>
      <el-form-item label="描述信息" style="width: 95%" prop="description">
        <el-input
          v-model="addRoleParams.description"
          style="width: 100%"
          :rows="5"
          type="textarea"
        />
      </el-form-item>
      <el-form-item style="margin-left: 302px">
        <el-button @click="dialogAddVisible = false">取消</el-button>
        <el-button type="primary" @click="doAddRole"> 确认 </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <!-- 修改角色对话框 -->
  <el-dialog
    v-model="dialogUpdateVisible"
    title="修改角色"
    width="500"
    :destroy-on-close="true"
    :modal="true"
    :close-on-click-modal="false"
  >
    <el-form
      label-width="80px"
      :inline="true"
      ref="updateDialogFormRef"
      :rules="rules"
      :model="updateRoleParams"
    >
      <el-form-item
        label="角色名称"
        style="width: 95%; margin-top: 10px"
        prop="name"
      >
        <el-input v-model="updateRoleParams.name"></el-input>
      </el-form-item>
      <el-form-item label="角色等级" style="width: 43%">
        <el-input-number
          v-model="updateRoleParams.level"
          class="mx-4"
          :min="1"
          :max="10"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="数据范围" style="width: 43%">
        <el-select v-model="updateRoleParams.dataScope" style="width: 100%">
          <el-option label="全部" value="全部" />
          <el-option label="本级" value="本级" />
          <el-option label="自定义" value="自定义" />
        </el-select>
      </el-form-item>
      <el-form-item
        label="数据权限"
        style="width: 95%"
        v-if="updateRoleParams.dataScope === '自定义'"
      >
        <el-tree-select
          ref="updatePermissionSelectRef"
          v-model="updateRoleParams.permissionList"
          :data="permissionData"
          show-checkbox
          check-strictly
          multiple
          :render-after-expand="false"
          style="width: 100%"
          node-key="id"
        />
      </el-form-item>
      <el-form-item label="描述信息" style="width: 95%" prop="description">
        <el-input
          v-model="updateRoleParams.description"
          style="width: 100%"
          :rows="5"
          type="textarea"
        />
      </el-form-item>
      <el-form-item style="margin-left: 302px">
        <el-button @click="dialogUpdateVisible = false">取消</el-button>
        <el-button type="primary" @click="doUpdateRole"> 确认 </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style lang="scss">
.body {
  box-sizing: border-box;
  position: absolute;
  left: 199px;
  top: 80px;
  width: calc(100% - 199px);
  padding: 26px 32px;
  .main {
    display: flex;
    flex-direction: column;
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
    .role {
      margin-top: 30px;
      display: flex;
      .table {
        flex: 3;
        .list {
          box-sizing: border-box;
          width: 100%;
          height: 55px;
          border: 1px solid #ebeef5;
          border-bottom: none;
          line-height: 55px;
          padding-left: 20px;
          font-size: 16px;
          font-weight: 700;
          color: #303133;
        }
      }
      .assignment-role {
        margin-left: 20px;
        flex: 1;
        border: 1px solid #ebeef5;
        .list {
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          width: 100%;
          height: 55px;
          border-bottom: 1px solid #ebeef5;
          line-height: 55px;
          padding: 0 20px;
          font-size: 16px;
          font-weight: 700;
          color: #303133;
        }
      }
    }
  }
}
::v-deep .el-tree-node__content.is-checked {
  background-color: black !important;
}
.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
