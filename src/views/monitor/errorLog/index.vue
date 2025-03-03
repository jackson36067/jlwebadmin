<script setup lang="ts">
import { exportLogDataAPI, getLogListAPI } from "@/apis/log";
import { formatDateForBackend, formatDateToString } from "@/utils/dateFormat";
import {
  Download,
  RefreshRight,
  Search,
  Delete,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { computed, inject, onMounted, ref } from "vue";

const isCollapse = inject("isCollapse");

const showQuery = ref(true);

const isShowQuery = () => {
  showQuery.value = showQuery.value ? false : true;
};

const form = ref({
  location: "",
  createTime: "",
});

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
  pageSize: 9,
  location: form.value.location || null,
  begin: formatDateForBackend(form.value.createTime[0]) || null, // 默认值为 null
  end: formatDateForBackend(form.value.createTime[1]) || null, // 默认值为 null
  isError: true,
  total: "",
}));

// 导出按钮可用性
const exportButton = ref(true);

// 表格数据
const tableData = ref([]);
// 是否加载表格
const tableLoad = ref(false);
const getLogList = async () => {
  const res = await getLogListAPI(queryParams.value);
  tableData.value = res.data.list;
  queryParams.value.total = res.data.total;
  exportButton.value = false;
};
// 加载表格函数
const loadTable = () => {
  tableLoad.value = true;
  setTimeout(() => {
    getLogList();
    tableLoad.value = false;
  }, 1000);
};
onMounted(() => {
  loadTable();
});

// 根据参数查询操作日志
const queryByParmas = () => {
  loadTable();
};

// 重置参数
const doReset = () => {
  form.value.location = "";
  form.value.createTime = "";
  loadTable();
};

// 刷新表格
const refreshDeptTable = () => {
  loadTable();
};

// 修改分页page-size(当前页码展示条数)时重新获取日志数据
const handleLogSizeChange = () => {
  loadTable();
};
// 修改分页current-page(当前页码)时重新获取日志数据
const handleLogCurrentChange = () => {
  loadTable();
};

// 导出日志数据
const exportLogData = async () => {
  await exportLogDataAPI(queryParams.value.isError)
    .then((data) => {
      // console.log(data);
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
      link.setAttribute("download", `${dateFormat}日志数据` + ".xlsx");
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

// 查看异常详情对话框可见性
const exceptionDetailDialogVisable = ref(false);

// 展示异常详情信息
const exceptionDetail = ref("");
const showExceptionDetail = (rowExceptionDetail: string) => {
  exceptionDetailDialogVisable.value = true;
  exceptionDetail.value = rowExceptionDetail;
};
</script>
<template>
  <div
    class="body"
    :class="{ left: isCollapse }"
    style="transition: all 0.3s; z-index: 9; overflow: hidden"
  >
    <div class="main">
      <div class="query" v-if="showQuery">
        <el-form :model="form" style="max-width: 100%">
          <el-form-item class="form-item">
            <el-input
              placeholder="输入IP来源查询"
              style="width: 210px"
              v-model="form.location"
            >
            </el-input>
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
              @click="queryByParmas"
            >
              搜索
            </el-button>
            <el-form-item class="form-item">
              <el-button :icon="RefreshRight" type="warning" @click="doReset">
                重置
              </el-button>
            </el-form-item>
          </el-form-item>
        </el-form>
      </div>
      <div class="button">
        <div class="operate">
          <el-button type="danger" :icon="Delete" style="font-size: 12px">
            已删除日志
          </el-button>
          <el-button
            type="warning"
            :icon="Download"
            style="font-size: 12px"
            @click="exportLogData"
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
        <div class="table">
          <el-table :data="tableData" v-loading="tableLoad" style="width: 100%">
            <el-table-column type="expand">
              <template #default="props">
                <div m="4">
                  <p m="t-0 b-2" style="margin: 20px 0">
                    <i
                      style="
                        font-size: 14px;
                        color: #99a9bf;
                        font-weight: 700;
                        font-style: normal;
                        margin-right: 5px;
                      "
                      >请求方法:</i
                    >
                    {{ props.row.method }}
                  </p>
                  <p m="t-0 b-2" style="margin-bottom: 20px">
                    <i
                      style="
                        font-size: 14px;
                        color: #99a9bf;
                        font-weight: 700;
                        font-style: normal;
                        margin-right: 5px;
                      "
                      >请求参数:</i
                    >
                    {{ props.row.params }}
                  </p>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="用户名" prop="username" width="200" />
            <el-table-column label="IP" prop="requestIp" width="200" />
            <el-table-column label="IP来源" prop="address" width="200" />
            <el-table-column label="描述" prop="description" width="200" />
            <el-table-column label="浏览器" prop="browser" width="200" />
            <el-table-column
              label="创建时间"
              prop="createTime"
              align="center"
              min-width="200"
            />
            <el-table-column label="异常详情" prop="exceptionDetail">
              <template #default="{ row }">
                <el-link
                  :underline="false"
                  @click="showExceptionDetail(row.exceptionDetail)"
                  >查看详情
                </el-link>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            style="margin-top: 20px"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[5, 9, 20, 40, 50, 100]"
            layout="total, prev, pager, next, sizes"
            :total="queryParams.total"
            v-model:current-page="queryParams.page"
            @size-change="handleLogSizeChange"
            @current-change="handleLogCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
  <el-dialog
    title="异常详情"
    v-model="exceptionDetailDialogVisable"
    width="500px"
    :destroy-on-close="true"
    :modal="true"
  >
    {{ exceptionDetail }}
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
    width: 100%;
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
      width: 100%;
      margin-top: 70px;
    }
  }
}
.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
