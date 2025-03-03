<script setup lang="ts">
import {
  exportOnlineUserInfoAPI,
  forceWithdrawUserAPI,
  getOnlineUserAPI,
} from "@/apis/user";
import type { rowInfo } from "@/types/online";
import { formatDateToString } from "@/utils/dateFormat";
import {
  Delete,
  Download,
  RefreshRight,
  Search,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { inject, onMounted, ref } from "vue";

const isCollapse = inject("isCollapse");

const showQuery = ref(true);
const isShowQuery = () => {
  showQuery.value = showQuery.value ? false : true;
};

const form = ref({
  page: 1,
  pageSize: 10,
  username: "",
});

// 导出按钮可用性
const exportButton = ref(true);

const onlineUserList = ref([]);
const tableLoad = ref(false);
const total = ref(1);
const getOnlineUser = async () => {
  const res = await getOnlineUserAPI(form.value);
  onlineUserList.value = res.data.list;
  total.value = res.data.total;
  if (onlineUserList.value.length > 0) {
    exportButton.value = false;
  }
};

const loadOnlinUserInfo = () => {
  tableLoad.value = true;
  setTimeout(() => {
    getOnlineUser();
    tableLoad.value = false;
  }, 1000);
};
onMounted(() => {
  loadOnlinUserInfo();
});

const handleOnlineUserCurrentChange = () => {
  loadOnlinUserInfo();
};

const handleOnlineUserSizeChange = () => {
  loadOnlinUserInfo();
};

// 点击刷新图标后刷新数据
const refreshDeptTable = () => {
  loadOnlinUserInfo();
};

// 通过参数查询
const queryByParmas = () => {
  loadOnlinUserInfo();
};

// 重置参数
const resetFields = () => {
  form.value.username = "";
};
// 点击重置后,重置参数,重新获取数据
const doReset = () => {
  resetFields();
  loadOnlinUserInfo();
};

// 拉黑按钮可用性
const withdrawalButtonDisabled = ref(true);

// 拉黑用户ip数据
const forceUserIpArray = ref<string[]>([]);
// 表格多选框改变监听事件
const handleSelectionChange = (row: rowInfo[]) => {
  if (row.length > 0) {
    withdrawalButtonDisabled.value = false;
  } else {
    withdrawalButtonDisabled.value = true;
  }
  forceUserIpArray.value = [];
  row.forEach((item) => {
    forceUserIpArray.value.push(item.ipAddress);
  });
};

// 点击每一行的拉黑按钮,拉黑该用户
const doRowBlockUser = (row: rowInfo) => {
  forceUserIpArray.value = [];
  forceUserIpArray.value.push(row.ipAddress);
  forceWithdrawUser(row.ipAddress);
};

// 点击强退按钮强制让用户退出登录
const forceWithdrawUser = async (ip: string) => {
  ElMessageBox.confirm(`此操作将ip${ip}拉黑, 是否继续？`, "Warning", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await forceWithdrawUserAPI(forceUserIpArray.value);
      loadOnlinUserInfo();
      ElMessage({ type: "success", message: "拉黑成功" });
    })
    .catch(() => {
      // 取消修改也要刷新页面
      ElMessage({
        type: "info",
        message: "取消拉黑",
      });
    });
};

// 导出用户数据
const exportOnlineUserInfo = async () => {
  await exportOnlineUserInfoAPI()
    .then((data) => {
      const url = URL.createObjectURL(
        new Blob([data.data], { type: "application/vnd.ms-excel;charset=utf8" })
      );
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      // 设置年份
      const date = new Date();
      const dateFormat = formatDateToString(date);
      // 下载文件
      link.setAttribute("download", `${dateFormat}在线用户数据` + ".xlsx");
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
  <div
    class="body"
    :class="{ left: isCollapse }"
    style="transition: all 0.3s; z-index: 9; overflow: hidden"
  >
    <div class="main">
      <div class="query" v-if="showQuery">
        <el-form
          :model="form"
          :resetFields="resetFields"
          style="max-width: 100%"
        >
          <el-form-item class="form-item">
            <el-input
              placeholder="输入用户名称查询"
              style="width: 210px"
              v-model="form.username"
            >
            </el-input>
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
          <el-button
            type="danger"
            :icon="Delete"
            style="font-size: 12px"
            :disabled="withdrawalButtonDisabled"
            @click="forceWithdrawUser"
          >
            拉黑
          </el-button>
          <el-button
            type="warning"
            :icon="Download"
            style="font-size: 12px"
            @click="exportOnlineUserInfo"
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
          <el-table
            :data="onlineUserList"
            style="width: 100%"
            row-key="id"
            v-loading="tableLoad"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column
              prop="username"
              label="用户名"
              align="center"
              width="200"
            />
            <el-table-column
              prop="name"
              label="用户昵称"
              align="center"
              width="200"
            />
            <el-table-column
              prop="deptName"
              label="部门"
              align="center"
              width="200"
            />
            <el-table-column
              prop="ipAddress"
              label="登录IP"
              align="center"
              width="200"
            />
            <el-table-column
              prop="loginLocation"
              label="登录地址"
              align="center"
              width="200"
            />
            <el-table-column
              prop="browser"
              label="浏览器"
              align="center"
              width="200"
            />
            <el-table-column
              prop="loginTime"
              label="登录时间"
              align="center"
              width="200"
            />
            <el-table-column label="操作" min-width="120" fixed="right">
              <template #default="{ row }">
                <el-link
                  type="info"
                  style="margin-right: 10px"
                  @click="doRowBlockUser(row)"
                >
                  拉黑
                </el-link>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            style="margin-top: 20px"
            v-model:page-size="form.pageSize"
            :page-sizes="[5, 10, 20, 40, 50, 100]"
            layout="total, prev, pager, next, sizes"
            :total="total"
            v-model:current-page="form.page"
            @size-change="handleOnlineUserSizeChange"
            @current-change="handleOnlineUserCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
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
