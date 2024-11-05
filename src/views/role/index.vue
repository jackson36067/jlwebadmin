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
import { getRoleWithPagingAPI, updateRoleMenuAPI } from "@/apis/role";
import { getMenuListAPI } from "@/apis/menu";
import { useLoginStore } from "@/stores/LoginStore";
import { formatDateToString, formatLocalDateTime } from "@/utils/dateFormat";
import { ElMessage } from "element-plus";

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
          >
            新增
          </el-button>

          <el-button type="success" :icon="EditPen" style="font-size: 12px">
            修改
          </el-button>
          <el-button type="danger" :icon="Delete" style="font-size: 12px">
            删除
          </el-button>
          <el-button type="warning" :icon="Download" style="font-size: 12px">
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
                <el-button type="warning" :icon="Edit" circle />
                <el-button type="danger" :icon="Delete" circle />
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
