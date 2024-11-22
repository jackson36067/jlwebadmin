<script setup lang="ts">
import { exportTaskLogDataAPI, getTaskLogListAPI } from "@/apis/taskLog";
import {
  addTaskAPI,
  deleteTaskAPI,
  exportTaskDataAPI,
  getTaskInfoByIdAPI,
  getTaskListAPI,
  pauseTaskAPI,
  resumeTaskAPI,
  updateTaskAPI,
} from "@/apis/timgin";
import {
  formatDateForBackend,
  formatDateToString,
  formatLocalDateTime,
} from "@/utils/dateFormat";
import {
  Delete,
  EditPen,
  Plus,
  Document,
  Search,
  RefreshRight,
  Download,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { M } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
import { computed, inject, onMounted, ref } from "vue";

const isCollapse = inject("isCollapse");
const form = ref({
  jobName: "",
  createTime: "",
});

// 是否展示搜索栏
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

const queryParams = computed(() => ({
  page: 1,
  pageSize: 10,
  jobName: form.value.jobName,
  begin: formatDateForBackend(form.value.createTime[0]) || null,
  end: formatDateForBackend(form.value.createTime[1]) || null,
}));

// 导出按钮可用性
const exportButton = ref(true);

// 获取任务调度列表数据
const taskList = ref([]);
const total = ref(1);
const getTaskList = async () => {
  const res = await getTaskListAPI(queryParams.value);
  res.data.list.forEach((item) => {
    item.createTime = formatLocalDateTime(item.createTime);
  });
  taskList.value = res.data.list;
  total.value = res.data.total;
  if (taskList.value.length > 0) {
    exportButton.value = false;
  }
};
const refreshInfo = () => {
  loading.value = true;
  setTimeout(() => {
    getTaskList();
    loading.value = false;
  }, 1000);
};
onMounted(() => {
  refreshInfo();
});

// 修改分页page-size(当前页码展示条数)时重新获取用户数据
const handleSizeChange = () => {
  refreshInfo();
};
// 修改分页current-page(当前页码)时重新获取用户数据
const handleCurrentChange = () => {
  refreshInfo();
};

// 点击搜索根据参数进行查询
const queryTaskListWithParams = () => {
  refreshInfo();
};

const loading = ref(false);
const resetFields = () => {
  form.value.jobName = "";
  form.value.createTime = "";
};
const doReset = () => {
  resetFields();
  refreshInfo();
};

const refreshTaskInfo = () => {
  loading.value = true;
  setTimeout(() => {
    getTaskList();
    loading.value = false;
  }, 1000);
};

// 新增任务对话框可见性
const dialogAddTableVisible = ref(false);

const dialogAddForm = ref({
  jobName: "",
  jobGroup: "",
  cronExpression: "",
  isPause: true,
  description: "",
  email: "",
  className: "",
  personInCharge: "",
});

// 新增弹窗中表单校验规则

// 新增弹窗中表单dom对象
const dialogAddTaskFormRef = ref(null);
const rules = ref({
  jobName: [{ required: true, trigger: "blur", message: "请输入任务名称" }],
  jobGroup: [{ required: true, trigger: "blur", message: "请输入任务分组" }],
  className: [{ required: true, trigger: "blur", message: "请输入Class名称" }],
  description: [{ required: true, trigger: "blur", message: "请输入任务描述" }],
  personInCharge: [
    { required: true, trigger: "blur", message: "请输入任务负责人" },
  ],
  email: [{ required: true, trigger: "blur", message: "请输入告警邮箱" }],
  cronExpression: [
    { required: true, trigger: "blur", message: "请输入Cron表达式" },
  ],
});

// 新增任务完成检验后调用接口
const doAddTask = () => {
  dialogAddTaskFormRef.value.validate(async (valid) => {
    if (valid) {
      await addTaskAPI(dialogAddForm.value);
      getTaskList();
      ElMessage({ type: "success", message: "新增任务成功" });
      dialogAddTableVisible.value = false;
    }
  });
};
// 任务暂停时,点击执行任务
const resumeTask = async (row: object) => {
  if (!row.isPause) {
    ElMessage({ type: "warning", message: "任务已经执行" });
    return;
  }
  const { id, jobName, jobGroup } = row;
  await resumeTaskAPI({ id, jobName, jobGroup });
  // 更新任务列表
  getTaskList();
  ElMessage({ type: "success", message: "执行任务成功" });
};

const pauseTask = async (row: object) => {
  if (row.isPause) {
    ElMessage({ type: "warning", message: "任务已经暂停" });
    return;
  }
  const { id, jobName, jobGroup } = row;
  await pauseTaskAPI({ id, jobName, jobGroup });
  // 更新任务列表
  getTaskList();
  ElMessage({ type: "success", message: "执行任务成功" });
};

const dialogUpdateTableVisible = ref(false);

const dialogUpdateForm = ref({
  id: "",
  jobName: "",
  jobGroup: "",
  cronExpression: "",
  isPause: true,
  description: "",
  email: "",
  className: "",
  personInCharge: "",
});

// 封装信息
const getTaskInfo = async (row: object) => {
  dialogUpdateTableVisible.value = true;
  // 获取该行的任务信息
  const res = await getTaskInfoByIdAPI(row.id);
  dialogUpdateForm.value = res.data;
};

// 编辑任务信息
const dialogUpdateTaskFormRef = ref(null);
const doUpdateTask = () => {
  dialogUpdateTaskFormRef.value.validate(async (valid) => {
    if (valid) {
      await updateTaskAPI(dialogUpdateForm.value);
      getTaskList();
      dialogUpdateTableVisible.value = false;
      ElMessage({ type: "success", message: "修改成功" });
    }
  });
};

// 复选框变化处理

// 需要删除的任务对象数组
const deleteTaskList = ref([]);
const updateButtonVisible = ref(true);
const deleteButtonVisible = ref(true);
const handleSelectionChange = (row) => {
  deleteButtonVisible.value = false;
  if (row.length == 0) {
    deleteButtonVisible.value = true;
  }
  if (row.length === 1) {
    updateButtonVisible.value = false;
    dialogUpdateForm.value = row[0];
  } else {
    updateButtonVisible.value = true;
  }
  deleteTaskList.value = [];
  row.forEach((item) => {
    const { id, jobName, jobGroup } = item;
    deleteTaskList.value.push({ id, jobName, jobGroup });
  });
};

// 点击删除按钮,删除复选框选中的任务
const elbox = (str: string) => {
  ElMessageBox.confirm(`此操作将删除${str}任务, 是否继续？`, "Warning", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await deleteTaskAPI(deleteTaskList.value);
      getTaskList();
      ElMessage({ type: "success", message: "删除成功" });
    })
    .catch(() => {
      // 取消修改也要刷新页面
      ElMessage({
        type: "info",
        message: "取消删除",
      });
    });
};
// 删除任务
const deleteTask = async () => {
  elbox("这些");
};
// 删除行任务
const deleteTaskRowInfo = (row) => {
  deleteTaskList.value = [];
  const { id, jobName, jobGroup } = row;
  deleteTaskList.value.push({ id, jobName, jobGroup });
  elbox(row.jobName);
};

// 日志对话框可见性
const dialogLogTableVisible = ref(false);

// 日志列表数据

// 查询任务日志参数对象
const logForm = ref({
  jobName: "",
  createTime: "",
  isSuccess: "",
});
const logQueryParams = computed(() => ({
  page: 1,
  pageSize: 6,
  jobName: logForm.value.jobName,
  begin: formatDateForBackend(logForm.value.createTime[0]) || null,
  end: formatDateForBackend(logForm.value.createTime[1]) || null,
}));

const taskLogList = ref([]);
const logTotal = ref(1);
const getTaskLogList = async () => {
  const res = await getTaskLogListAPI(logQueryParams.value);
  console.log(res.data.list);
  res.data.list.forEach((item) => {
    item.createTime = formatLocalDateTime(item.createTime);
  });
  taskLogList.value = res.data.list;
  logTotal.value = res.data.total;
};
const logLoading = ref(false);

// 点击日志加载日志信息
const dialogLog = () => {
  dialogLogTableVisible.value = true;
  logLoading.value = true;
  setTimeout(() => {
    getTaskLogList();
    logLoading.value = false;
  }, 1000);
};

const handleLogCurrentChange = () => {
  getTaskLogList();
};

// 点击搜索,根据条件搜索任务日志
const queryTaskLogListWithParams = () => {
  logLoading.value = true;
  setTimeout(() => {
    getTaskLogList();
    logLoading.value = false;
  }, 1000);
};

// 点击重置,重置条件重新获取日志
const logResetFields = () => {
  logForm.value.jobName = "";
  logForm.value.createTime = "";
  logForm.value.isSuccess = "";
};
const doLogReset = () => {
  logResetFields();
  logLoading.value = true;
  setTimeout(() => {
    getTaskLogList();
    logLoading.value = false;
  }, 1000);
};

// 导出任务数据
const exportTaskData = async () => {
  await exportTaskDataAPI()
    .then((data) => {
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
      link.setAttribute("download", `${dateFormat}定时任务数据` + ".xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); //下载完成移除元素
      window.URL.revokeObjectURL(url); //释放掉blob对象
      ElMessage({ type: "success", message: "导出成功" });
    })
    .catch((error) => {
      console.error("下载错误", error);
      ElMessage({ type: "error", message: "导出失败" });
    });
};

// 导出任务日志数据
const exportTaskLogData = async () => {
  await exportTaskLogDataAPI()
    .then((data) => {
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
      link.setAttribute("download", `${dateFormat}任务日志数据` + ".xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); //下载完成移除元素
      window.URL.revokeObjectURL(url); //释放掉blob对象
      ElMessage({ type: "success", message: "导出成功" });
    })
    .catch((error) => {
      console.error("下载错误", error);
      ElMessage({ type: "error", message: "导出失败" });
    });
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
              v-model="form.jobName"
              placeholder="输入任务名称搜索"
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
              @click="queryTaskListWithParams"
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
            @click="dialogAddTableVisible = true"
          >
            新增
          </el-button>

          <el-button
            type="success"
            :icon="EditPen"
            style="font-size: 12px"
            :disabled="updateButtonVisible"
            @click="dialogUpdateTableVisible = true"
          >
            修改
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            style="font-size: 12px"
            :disabled="deleteButtonVisible"
            @click="deleteTask"
          >
            删除
          </el-button>
          <el-button
            type="warning"
            :icon="Download"
            style="font-size: 12px"
            @click="exportTaskData"
            :disabled="exportButton"
          >
            导出
          </el-button>
          <el-button
            type="info"
            :icon="Document"
            style="font-size: 12px"
            @click="dialogLog"
          >
            日志
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
          <span @click="refreshTaskInfo">
            <svgIcon name="refresh" width="12px" height="12px" />
          </span>
          <span>
            <svgIcon name="grid" width="12px" height="12px" />
          </span>
        </div>
      </div>
      <div class="table">
        <el-table
          :data="taskList"
          style="width: 100%"
          show-overflow-tooltip
          v-loading="loading"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column
            fixed
            prop="id"
            label="任务ID"
            width="150"
            align="center"
          />
          <el-table-column
            fixed
            prop="jobName"
            label="任务名称"
            width="150"
            align="center"
          />
          <el-table-column
            fixed
            prop="jobGroup"
            label="任务分组"
            width="150"
            align="center"
          />
          <el-table-column
            prop="className"
            label="class名称"
            width="150"
            align="center"
          />
          <el-table-column
            prop="cronExpression"
            label="cron表达式"
            width="160"
            align="center"
          />
          <el-table-column
            prop="isPause"
            label="状态"
            min-width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-button
                disabled="true"
                :class="{ pause: row.isPause, resume: !row.isPause }"
                >{{ row.isPause ? "已暂停" : "执行中" }}</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="description"
            label="描述"
            width="200"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="200"
            align="center"
          />
          <el-table-column label="操作" min-width="100" align="center">
            <template #default="{ row }">
              <el-link
                type="info"
                style="margin-right: 10px; color: #000"
                @click="getTaskInfo(row)"
                >编辑</el-link
              >
              <el-link
                type="info"
                style="margin-right: 10px; color: #000"
                @click="resumeTask(row)"
                >执行</el-link
              >
              <el-link
                type="info"
                style="margin-right: 10px; color: #000"
                @click="pauseTask(row)"
                >暂停</el-link
              >
              <el-link
                type="info"
                style="color: #000"
                @click="deleteTaskRowInfo(row)"
                >删除</el-link
              >
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
  <el-dialog
    v-model="dialogAddTableVisible"
    title="新增任务"
    width="568"
    :destroy-on-close="true"
    :modal="true"
    :close-on-click-modal="false"
  >
    <el-form
      style="display: flex; flex-wrap: wrap"
      :model="dialogAddForm"
      label-width="100px"
      :rules="rules"
      ref="dialogAddTaskFormRef"
    >
      <el-form-item label="任务名称" prop="jobName" style="width: 50%">
        <el-input v-model="dialogAddForm.jobName" />
      </el-form-item>
      <el-form-item label="任务分组" style="width: 50%" prop="jobGroup">
        <el-input v-model="dialogAddForm.jobGroup" />
      </el-form-item>
      <el-form-item label="class名称" style="width: 50%" prop="className">
        <el-input v-model="dialogAddForm.className" />
      </el-form-item>
      <el-form-item label="cron表达式" style="width: 50%" prop="cronExpression">
        <el-input v-model="dialogAddForm.cronExpression" />
      </el-form-item>
      <el-form-item label="状态" style="width: 50%">
        <el-radio-group v-model="dialogAddForm.isPause">
          <el-radio :value="false">启用</el-radio>
          <el-radio :value="true">暂停</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="告警邮箱" style="width: 50%" prop="email">
        <el-input v-model="dialogAddForm.email" />
      </el-form-item>
      <el-form-item label="任务描述" style="width: 50%" prop="description">
        <el-input v-model="dialogAddForm.description" />
      </el-form-item>
      <el-form-item label="任务负责人" style="width: 50%" prop="personInCharge">
        <el-input v-model="dialogAddForm.personInCharge" />
      </el-form-item>
      <el-form-item style="margin: 20px 0 0 300px">
        <el-button style="color: #000" @click="dialogAddTableVisible = false">
          取消
        </el-button>
        <el-button
          style="background-color: #000; color: #fff"
          @click="doAddTask"
        >
          确认
        </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <!-- 编辑任务对话框 -->
  <el-dialog
    v-model="dialogUpdateTableVisible"
    title="编辑任务"
    width="568"
    :destroy-on-close="true"
    :modal="true"
    :close-on-click-modal="false"
  >
    <el-form
      style="display: flex; flex-wrap: wrap"
      :model="dialogUpdateForm"
      label-width="100px"
      :rules="rules"
      ref="dialogUpdateTaskFormRef"
    >
      <el-form-item label="任务名称" prop="jobName" style="width: 50%">
        <el-input v-model="dialogUpdateForm.jobName" />
      </el-form-item>
      <el-form-item label="任务分组" style="width: 50%" prop="jobGroup">
        <el-input v-model="dialogUpdateForm.jobGroup" />
      </el-form-item>
      <el-form-item label="class名称" style="width: 50%" prop="className">
        <el-input v-model="dialogUpdateForm.className" />
      </el-form-item>
      <el-form-item label="cron表达式" style="width: 50%" prop="cronExpression">
        <el-input v-model="dialogUpdateForm.cronExpression" />
      </el-form-item>
      <el-form-item label="状态" style="width: 50%">
        <el-radio-group v-model="dialogUpdateForm.isPause">
          <el-radio :value="false">启用</el-radio>
          <el-radio :value="true">暂停</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="告警邮箱" style="width: 50%" prop="email">
        <el-input v-model="dialogUpdateForm.email" />
      </el-form-item>
      <el-form-item label="任务描述" style="width: 50%" prop="description">
        <el-input v-model="dialogUpdateForm.description" />
      </el-form-item>
      <el-form-item label="任务负责人" style="width: 50%" prop="personInCharge">
        <el-input v-model="dialogUpdateForm.personInCharge" />
      </el-form-item>
      <el-form-item style="margin: 20px 0 0 300px">
        <el-button
          style="color: #000"
          @click="dialogUpdateTableVisible = false"
        >
          取消
        </el-button>
        <el-button
          style="background-color: #000; color: #fff"
          @click="doUpdateTask"
        >
          确认
        </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <!-- 点击日志弹窗 -->
  <el-dialog
    v-model="dialogLogTableVisible"
    title="执行日志"
    width="1640"
    :destroy-on-close="true"
    :modal="true"
  >
    <div class="query" v-if="showQuery">
      <el-form
        :model="form"
        style="max-width: 100%"
        :resetFields="logResetFields"
      >
        <el-form-item class="form-item">
          <el-input
            v-model="logForm.jobName"
            placeholder="输入任务名称搜索"
            style="width: 210px"
          />
        </el-form-item>
        <el-form-item style="margin: 0 10px" class="form-item">
          <div class="demo-date-picker">
            <div class="block">
              <el-date-picker
                v-model="logForm.createTime"
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
            v-model="logForm.isSuccess"
            placeholder="日志状态"
            style="width: 120px"
          >
            <el-option label="成功" :value="true" />
            <el-option label="失败" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item class="form-item">
          <el-button
            :icon="Search"
            style="margin: 0 10px"
            type="success"
            @click="queryTaskLogListWithParams"
          >
            搜索
          </el-button>
        </el-form-item>
        <el-form-item class="form-item">
          <el-button :icon="RefreshRight" type="warning" @click="doLogReset"
            >重置</el-button
          >
        </el-form-item>
        <el-form-item class="form-item">
          <el-button
            :icon="Download"
            style="
              background-color: #000;
              color: #fff;
              font-size: 12px;
              margin-left: 10px;
              border: 1px #000 solid;
            "
            @click="exportTaskLogData"
          >
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        :data="taskLogList"
        style="width: 100%"
        show-overflow-tooltip
        stripe
        v-loading="logLoading"
      >
        <el-table-column
          fixed
          prop="jobName"
          label="任务名称"
          width="150"
          align="center"
        />
        <el-table-column
          prop="className"
          label="class名称"
          width="150"
          align="center"
        />
        <el-table-column
          prop="cronExpression"
          label="cron表达式"
          width="160"
          align="center"
        />
        <el-table-column
          prop="exceptionDetail"
          label="异常详情"
          width="160"
          align="center"
        />
        <el-table-column prop="time" label="耗时" width="160" align="center" />
        <el-table-column
          prop="isSuccess"
          label="状态"
          min-width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              disabled="true"
              :class="{ error: !row.isSuccess, resume: row.isSuccess }"
              >{{ row.isSuccess ? "成功" : "失败" }}</el-button
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="200"
          align="center"
        />
      </el-table>
      <el-pagination
        style="margin-top: 20px"
        v-model:page-size="logQueryParams.pageSize"
        layout="total, prev, pager, next"
        :total="logTotal"
        v-model:current-page="logQueryParams.page"
        @current-change="handleLogCurrentChange"
      />
    </div>
  </el-dialog>
</template>
<style scoped lang="scss">
.boby {
  box-sizing: border-box;
  position: absolute;
  left: 199px;
  top: 80px;
  width: calc(100% - 199px);
  padding: 26px 32px;
  .main {
    display: flex;
    flex-direction: row;
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
  }
}
.table {
  margin-top: 30px;
  .pause {
    color: #e7a753;
    background-color: #fdf6ec;
  }
  .resume {
    background-color: #f0f9eb;
    color: #74c550;
  }
  .error {
    background-color: #fef0f0;
    color: #f69896;
  }
}

.query {
  display: block;
  .form-item {
    float: left;
  }
}
.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
