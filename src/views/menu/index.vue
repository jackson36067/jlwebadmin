<script setup lang="ts">
import { getMenuListAPI } from "@/apis/menu";
import { formatDateForBackend, formatLocalDateTime } from "@/utils/dateFormat";
import {
  Delete,
  Download,
  Edit,
  EditPen,
  Plus,
  RefreshRight,
  Search,
} from "@element-plus/icons-vue";
import { inject, onMounted, ref, computed } from "vue";

const collapse = inject("collapse");

const showQuery = ref(true);

const form = ref({
  title: "",
  createTime: "",
});

const isShowQuery = () => {
  showQuery.value = showQuery.value === true ? false : true;
};

// 是否加载表格
const tableLoad = ref(false);

// 格式化表格数据
const formatMenuListData = (data: Array<object>) => {
  return data.map((item: any) => {
    return {
      id: item.id,
      title: item.title,
      icon: item.icon,
      menuSort: item.menuSort,
      permission: item.permission,
      component: item.component,
      iFrame: item.iFrame ? "是" : "否",
      cache: item.cache ? "是" : "否",
      hidden: item.hidden ? "是" : "否",
      createTime: formatLocalDateTime(item.createTime),
      // hasChildren: item.menuListVOList ? true : false,
      children: item.menuListVOList
        ? formatMenuListData(item.menuListVOList)
        : null,
    };
  });
};

// 查询参数对象
const queryParams = computed(() => ({
  title: form.value.title,
  begin: formatDateForBackend(form.value.createTime[0]) || null, // 默认值为 null
  end: formatDateForBackend(form.value.createTime[1]) || null, // 默认值为 null
}));

const menuTableData = ref([]);
const getMenuList = async () => {
  // 获取menu菜单信息
  const res = await getMenuListAPI(queryParams.value);
  menuTableData.value = formatMenuListData(res.data);
};
onMounted(() => {
  getMenuList();
});

// 根据参数获取对象
const doQueryMenuList = () => {
  if (form.value.title) {
    queryParams.value.title = form.value.title;
  }
  if (form.value.createTime) {
    queryParams.value.begin = formatDateForBackend(form.value.createTime[0]);
    queryParams.value.end = formatDateForBackend(form.value.createTime[1]);
  }
  tableLoad.value = true;
  setTimeout(() => {
    getMenuList();
    tableLoad.value = false;
  }, 2000);
};

// 重置表单
const resetFields = () => {
  form.value.title = "";
  form.value.createTime = "";
  // 重新获取role数据
  tableLoad.value = true;
  setTimeout(() => {
    getMenuList();
    tableLoad.value = false;
  }, 2000);
};

// 点击重置按钮后将数据重置
const doReset = () => {
  resetFields();
};

// 刷新表格内容
const refreshMenuTable = () => {
  // 重新获取role数据
  tableLoad.value = true;
  setTimeout(() => {
    getMenuList();
    tableLoad.value = false;
  }, 2000);
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
</script>
<template>
  <div class="body" :class="{ left: collapse }">
    <div class="main">
      <div class="query" v-if="showQuery">
        <el-form
          :model="form"
          style="max-width: 100%"
          :resetFields="resetFields"
        >
          <el-form-item class="form-item">
            <el-input
              v-model="form.title"
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
              @click="doQueryMenuList"
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
          <span>
            <svgIcon
              name="refresh"
              width="12px"
              height="12px"
              @click="refreshMenuTable"
            />
          </span>
          <span>
            <svgIcon name="grid" width="12px" height="12px" />
          </span>
        </div>
      </div>
      <div class="table">
        <el-table
          :data="menuTableData"
          style="width: 100%"
          row-key="id"
          border
          v-loading="tableLoad"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column prop="title" label="菜单标题" align="center" />
          <el-table-column prop="icon" label="图标" align="center">
            <template #default="{ row }">
              <SvgIcon :name="row.icon" />
            </template>
          </el-table-column>
          <el-table-column prop="menuSort" label="排序" align="center" />
          <el-table-column prop="permission" label="权限标识" align="center" />
          <el-table-column prop="component" label="组件路径" align="center" />
          <el-table-column prop="iFrame" label="外链" align="center" />
          <el-table-column prop="cache" label="缓存" align="center" />
          <el-table-column prop="hidden" label="可见" align="center" />
          <el-table-column prop="createTime" label="创建日期" align="center" />
          <el-table-column prop="icon" label="图标" align="center">
            <template #default="">
              <el-button type="warning" :icon="Edit" circle />
              <el-button type="danger" :icon="Delete" circle />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
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
