<script setup lang="ts">
import {
  addDeptAPI,
  deleteDeptByIdsAPI,
  exportDeptDataAPI,
  getDeptListAPI,
  updateDeptAPI,
} from "@/apis/dept";
import type { deptList, deptTree, deptRowInfo } from "@/types/dept";
import { transformData } from "@/utils/dataFormat";
import {
  formatDateForBackend,
  formatDateToString,
  formatLocalDateTime,
} from "@/utils/dateFormat";
import {
  Delete,
  Download,
  Edit,
  EditPen,
  Plus,
  RefreshRight,
  Search,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { inject, onMounted } from "vue";
import { ref, computed } from "vue";
const isCollapse = inject("isCollapse");

const form = ref({
  name: "",
  enabled: "",
  createTime: "",
});

// 是否展示.query
const showQuery = ref(true);
const isShowQuery = () => {
  showQuery.value = showQuery.value === true ? false : true;
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

// 获取部门列表请求参数封装
const queryParams = computed(() => ({
  name: form.value.name || null,
  enabled: form.value.enabled || null,
  begin: formatDateForBackend(form.value.createTime[0]) || null, // 默认值为 null
  end: formatDateForBackend(form.value.createTime[1]) || null, // 默认值为 null
}));

// 格式化部门列表数据
const formatDeptDataList = (data: deptList[]): deptTree[] => {
  return data.map((item: deptList) => {
    return {
      id: item.id,
      pid: item.pid,
      name: item.name,
      deptSort: item.deptSort,
      enabled: item.enabled,
      createTime: formatLocalDateTime(item.createTime),
      children: item.subDeptVOList
        ? formatDeptDataList(item.subDeptVOList)
        : [],
    };
  });
};

// 导出按钮可用性
const exportButton = ref(true);

// 获取部门列表
const deptList = ref<Array<object>>([]);

// 新增以及修改时的部门选择
const dialogDeptList = ref([]);
const getDeptList = async () => {
  const res = await getDeptListAPI(queryParams.value);
  deptList.value = formatDeptDataList(res.data);
  dialogDeptList.value = transformData(res.data);
  if (deptList.value.length > 0) {
    exportButton.value = false;
  }
};

// 重新加载表格
const tableLoad = ref(false);
const refreshDeptTable = () => {
  tableLoad.value = true;
  setTimeout(() => {
    getDeptList();
    tableLoad.value = false;
  }, 1000);
};

onMounted(() => {
  refreshDeptTable();
});

// 重置表单
function resetFields() {
  form.value.createTime = "";
  form.value.enabled = "";
  form.value.name = "";
}

const doReset = () => {
  resetFields();
  // 重新获取部门菜单
  refreshDeptTable();
};

// 点击搜索时带参数查询部门
const doQueryDeptList = () => {
  tableLoad.value = true;
  setTimeout(() => {
    getDeptList();
    tableLoad.value = false;
  }, 2000);
};

// 新增对话框是否可见
const dialogAddDeptVisilbe = ref<boolean>(false);

// 新增部门参数
const addDeptForm = ref({
  name: null,
  deptSort: "999",
  pid: null,
  enabled: true,
  type: "1", // 多余字段,用与控制是否为顶级部门 (1.是顶级部门,0.不是顶级部门)
});

// 新增部门

// 校验规则
const addFomrRef = ref<FormInstance>();
const rules = {
  name: [{ required: true, trigger: "blur", message: "请输入名称" }],
  deptSort: [
    {
      required: true,
      type: "Number",
      trigger: "blur",
      message: "请输入序号",
    },
  ],
};
const addDept = () => {
  addFomrRef.value!.validate(async (valid) => {
    if (valid) {
      await addDeptAPI(addDeptForm.value);
      getDeptList();
      dialogAddDeptVisilbe.value = false;
      ElMessage({ type: "success", message: "新增成功" });
    } else {
      ElMessage({ type: "info", message: "请填写相应内容" });
    }
  });
};

// 修改部门参数
const updateDeptForm = ref({
  id: "",
  name: "",
  deptSort: "999",
  pid: "",
  enabled: true,
  type: "1", // 多余字段,用与控制是否为顶级部门 (1.是顶级部门,0.不是顶级部门)
});

// 修改部门对话框可见性
const dialogUpdateDeptVisilbe = ref(false);

// 删除以及修改按钮可用性 (刚开始不可用)
const deleteButtonVisible = ref(true);
const updateButtonVisible = ref(true);

// 复选框发生变化时,控制删除以及修改按钮可用性

const deleteDeptIds = ref<string[]>([]);
const handleSelectionChange = (row: deptRowInfo[]) => {
  deleteDeptIds.value = [];
  updateButtonVisible.value = true;
  if (row.length === 1) {
    updateButtonVisible.value = false;
    // 封装编辑部门参数
    updateDeptForm.value = row[0];
    updateDeptForm.value.type = row[0].pid === null ? "1" : "0";
  }
  deleteButtonVisible.value = false;
  row.forEach((item) => {
    deleteDeptIds.value.push(item.id);
  });
};
// 点击编辑部门对话框确认键后确认修改用户
const updateDept = async () => {
  await updateDeptAPI(updateDeptForm.value);
  getDeptList();
  ElMessage({ type: "success", message: "修改成功" });
  dialogUpdateDeptVisilbe.value = false;
};

// 每一行的状态栏修改
const updateDeptEnabled = async (row: deptRowInfo) => {
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
      updateDeptForm.value.enabled = row.enabled;
      updateDeptForm.value.id = row.id;
      updateDeptForm.value.deptSort = row.deptSort;
      updateDeptForm.value.pid = row.pid;
      updateDeptForm.value.name = row.name;
      await updateDeptAPI(updateDeptForm.value);
      // 修改成功后刷新页面
      getDeptList();
      ElMessage({
        type: "success",
        message: "修改成功",
      });
    })
    .catch(() => {
      // 取消修改也要刷新页面
      ElMessage({
        type: "info",
        message: "取消修改",
      });
    });
};

// 每一行编辑按钮进行修改部门
const updateDeptRowInfo = (row: deptRowInfo) => {
  dialogUpdateDeptVisilbe.value = true;
  // 封装编辑部门参数
  updateDeptForm.value = row;
  updateDeptForm.value.type = row.pid === null ? "1" : "0";
};

// 批量删除部门
const deleteDept = async () => {
  ElMessageBox.confirm("你确认要删除这些部门吗", "Warning", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await deleteDeptByIdsAPI(deleteDeptIds.value);
      // 修改成功后刷新页面
      getDeptList();
      ElMessage({
        type: "success",
        message: "删除成功",
      });
    })
    .catch(() => {
      // 取消修改也要刷新页面
      ElMessage({
        type: "info",
        message: "取消删除",
      });
    });
};

// 每一行删除按钮删除部门
const deleteDeptRowInfo = (row: deptRowInfo) => {
  deleteDeptIds.value = [];
  deleteDeptIds.value.push(row.id);
  ElMessageBox.confirm(`你确认要删除部门${row.name}吗`, "Warning", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await deleteDeptByIdsAPI(deleteDeptIds.value);
      // 修改成功后刷新页面
      getDeptList();
      ElMessage({
        type: "success",
        message: "删除成功",
      });
    })
    .catch(() => {
      // 取消修改也要刷新页面
      ElMessage({
        type: "info",
        message: "取消删除",
      });
    });
};

// 导出部门数据
const exportDeptData = async () => {
  await exportDeptDataAPI()
    .then((data) => {
      if (!data) {
        return;
      }
      const url = window.URL.createObjectURL(
        new Blob([data.data], { type: "application/vnd.ms-excel;charset=utf8" })
      );
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      // 设置年份
      const date = new Date();
      const dateFormat = formatDateToString(date);
      // 下载文件
      link.setAttribute("download", `${dateFormat}部门数据` + ".xlsx");
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
</script>
<template>
  <div
    class="body"
    :class="[{ left: isCollapse }]"
    style="transition: all 0.3s; z-index: 9; overflow: hidden"
  >
    <div class="main">
      <div class="query" v-if="showQuery">
        <el-form
          :model="form"
          style="max-width: 100%"
          :resetFields="resetFields"
        >
          <el-form-item class="form-item">
            <el-input
              v-model="form.name"
              placeholder="输入部门名称搜索"
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
              @click="doQueryDeptList"
            >
              搜索
            </el-button>
          </el-form-item>
          <el-form-item class="form-item">
            <el-button :icon="RefreshRight" type="warning" @click="doReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="button">
        <div class="operate">
          <el-button
            :icon="Plus"
            style="background-color: #000; color: #fff; font-size: 12px"
            @click="dialogAddDeptVisilbe = true"
          >
            新增
          </el-button>

          <el-button
            type="success"
            :icon="EditPen"
            style="font-size: 12px"
            :disabled="updateButtonVisible"
            @click="dialogUpdateDeptVisilbe = true"
          >
            修改
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            style="font-size: 12px"
            :disabled="deleteButtonVisible"
            @click="deleteDept"
          >
            删除
          </el-button>
          <el-button
            type="warning"
            :icon="Download"
            style="font-size: 12px"
            @click="exportDeptData"
            :disabled="exportButton"
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
          <span>
            <svgIcon
              name="refresh"
              width="12px"
              height="12px"
              @click="refreshDeptTable"
            />
          </span>
          <span>
            <svgIcon name="grid" width="12px" height="12px" />
          </span>
        </div>
      </div>
      <div class="table">
        <el-table
          :data="deptList"
          style="width: 100%"
          row-key="id"
          v-loading="tableLoad"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="名称" align="center" />
          <el-table-column prop="deptSort" label="排序" align="center" />
          <el-table-column prop="enabled" label="激活" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.enabled"
                class="ml-2"
                style="
                  --el-switch-on-color: #409eff;
                  --el-switch-off-color: #ff4949;
                "
                @change="updateDeptEnabled(row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建日期" align="center" />
          <el-table-column label="操作" align="center">
            <template #default="{ row }">
              <el-button
                link
                type="warning"
                :icon="Edit"
                circle
                @click="updateDeptRowInfo(row)"
              />
              <el-button
                link
                type="danger"
                :icon="Delete"
                circle
                @click="deleteDeptRowInfo(row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <el-dialog
    v-model="dialogAddDeptVisilbe"
    title="新增部门"
    :destroy-on-close="true"
    :modal="true"
    :close-on-click-modal="false"
    width="500px"
  >
    <el-form
      :model="addDeptForm"
      :inline="true"
      label-width="auto"
      ref="addFomrRef"
      :rules="rules"
      style="padding-right: 30px"
    >
      <el-form-item prop="name" label="部门名称" style="width: 100%">
        <el-input v-model="addDeptForm.name"></el-input>
      </el-form-item>
      <el-form-item prop="deptSort" label="部门排序" style="width: 100%">
        <el-input-number
          v-model="addDeptForm.deptSort"
          :min="1"
          controls-position="right"
          style="width: 100%"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="顶级部门" style="margin-right: 35px">
        <el-radio-group v-model="addDeptForm.type" class="custom-radio">
          <el-radio value="1">是</el-radio>
          <el-radio value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="addDeptForm.enabled" class="custom-radio">
          <el-radio :value="true">启用</el-radio>
          <el-radio :value="false">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="上级部门"
        v-if="addDeptForm.type === '0'"
        style="width: 100%"
      >
        <el-tree-select
          v-model="addDeptForm.pid"
          :data="dialogDeptList"
          filterable
          :render-after-expand="false"
          check-strictly
          style="width: 100%"
          placeholder="选择上级类目"
        />
      </el-form-item>
    </el-form>
    <el-form-item style="margin: 20px 0 0 300px">
      <el-button style="color: #000" @click="dialogAddDeptVisilbe = false">
        取消
      </el-button>
      <el-button style="background-color: #000; color: #fff" @click="addDept">
        确认
      </el-button>
    </el-form-item>
  </el-dialog>

  <!-- 编辑部门对话框 -->
  <el-dialog
    v-model="dialogUpdateDeptVisilbe"
    title="编辑部门"
    :destroy-on-close="true"
    :modal="true"
    :close-on-click-modal="false"
    width="500px"
  >
    <el-form
      :model="updateDeptForm"
      :inline="true"
      label-width="auto"
      ref="addFomrRef"
      :rules="rules"
      style="padding-right: 30px"
    >
      <el-form-item prop="name" label="部门名称" style="width: 100%">
        <el-input v-model="updateDeptForm.name"></el-input>
      </el-form-item>
      <el-form-item prop="deptSort" label="部门排序" style="width: 100%">
        <el-input-number
          v-model="updateDeptForm.deptSort"
          :min="1"
          controls-position="right"
          style="width: 100%"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="顶级部门" style="margin-right: 35px">
        <el-radio-group v-model="updateDeptForm.type" class="custom-radio">
          <el-radio value="1">是</el-radio>
          <el-radio value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="updateDeptForm.enabled" class="custom-radio">
          <el-radio :value="true">启用</el-radio>
          <el-radio :value="false">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="上级部门"
        v-if="updateDeptForm.type === '0'"
        style="width: 100%"
      >
        <el-tree-select
          v-model="updateDeptForm.pid"
          :data="dialogDeptList"
          filterable
          :render-after-expand="false"
          check-strictly
          style="width: 100%"
          placeholder="选择上级类目"
        />
      </el-form-item>
    </el-form>
    <el-form-item style="margin: 20px 0 0 300px">
      <el-button style="color: #000" @click="dialogUpdateDeptVisilbe = false">
        取消
      </el-button>
      <el-button
        style="background-color: #000; color: #fff"
        @click="updateDept"
      >
        确认
      </el-button>
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
  transition: all 0.5s;
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
    .table {
      margin-top: 30px;
    }
  }
}
.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
