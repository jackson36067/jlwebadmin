<script setup lang="ts">
import {
  addMenuAPI,
  deleteMenuAPI,
  exportMenuDataAPI,
  getMenuListAPI,
  updateMenuAPI,
} from "@/apis/menu";
import SvgIcon from "@/components/svg/svgIcon.vue";
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
      type: item.type,
      name: item.name,
      path: item.path,
      pid: item.pid,
      createTime: formatLocalDateTime(item.createTime),
      // hasChildren: item.menuListVOList ? true : false,
      children: item.menuListVOList
        ? formatMenuListData(item.menuListVOList)
        : null,
    };
  });
};

// 将得到的菜单改成Tree展示所需类型
const formatMenuTreeData = (data: Array<object>) => {
  return data.map((item: any) => {
    return {
      id: item.id,
      label: item.title,
      children: item.menuListVOList
        ? formatMenuTreeData(item.menuListVOList)
        : [], // 递归转换子部门
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
const menuTreeData = ref([]);
const getMenuList = async () => {
  // 获取menu菜单信息
  const res = await getMenuListAPI(queryParams.value);
  menuTableData.value = formatMenuListData(res.data);
  menuTreeData.value = formatMenuTreeData(res.data);
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

// 新增参数
const addForm = ref({
  type: 0, // 菜单类型：目录、菜单、按钮
  icon: "", // 菜单图标
  iFrame: false, // 外链菜单
  cache: false, // 菜单缓存
  hidden: true, // 菜单可见
  title: "", // 菜单标题
  permission: "", // 权限标识
  path: "", // 路由地址
  name: "", // 组件名称
  component: "", // 组件路径
  menuSort: 999, // 菜单排序
  pid: "", // 上级类别
});

// 表格校验规格
const rules = {
  title: [{ required: true, trigger: "blur", message: "请输入标题" }],
  path: [{ required: true, trigger: "blur", message: "请输入地址" }],
};

// 图标列表
const iconList = ref<Array<string>>([
  "alipay",
  "anq",
  "app",
  "backup",
  "blog",
  "chain",
  "chart",
  "codeConsole",
  "dashboard",
  "database",
  "date",
  "deploy",
  "dept",
  "dev",
  "develop",
  "dictionary",
  "doc",
  "download",
  "edit",
  "education",
  "email",
  "error",
  "exit-fullscreen",
  "fullscreen",
  "fwb",
  "github",
  "gonggao",
  "grid",
  "icon",
  "image",
  "index",
  "international",
  "ipvisits",
  "java",
  "layout",
  "link",
  "list",
  "lock",
  "log",
  "login",
  "markdown",
  "menu",
  "message",
  "mnt",
  "money",
  "monitor",
  "nested",
  "password",
  "people",
  "peoples",
  "permission",
  "phone",
  "qiniu",
  "quanpin",
  "redis",
  "refresh",
  "role",
  "search",
  "server",
  "shopping",
  "size",
  "skill",
  "source",
  "sqlMonitor",
  "Steve-Jobs",
  "swagger",
  "sys-tools",
  "system",
  "system1",
  "tab",
  "theme",
  "timing",
  "tools",
  "tree-table",
  "tree",
  "unlock",
  "user",
  "user1",
  "validCode",
  "visits",
  "web",
  "wechat",
  "weixin",
  "zujian",
]);

// 新增操作
// 新增对话框可见性
const dialogAddTableVisible = ref(false);

// 图标列表是否展示
const iconListVisable = ref(false);
// 选择图标后更换图标
const selectAddMenuIcon = (icon: string) => {
  addForm.value.icon = icon;
  iconListVisable.value = false;
};

// 点击新增按钮让dialog可见
const showAddDialog = () => {
  dialogAddTableVisible.value = true;
};

// 新增表格dom对象
const addFomrRef = ref(null);
// 新增菜单
const submitFormAndAddMenu = () => {
  addFomrRef.value.validate(async (valid) => {
    if (valid) {
      await addMenuAPI(addForm.value);
      getMenuList();
      dialogAddTableVisible.value = false;
      ElMessage({ type: "success", message: "新增成功" });
    } else {
      ElMessage({ type: "info", message: "请填写相应内容" });
    }
  });
};

// 修改弹窗是否可见
const dialogUpdateTableVisible = ref<boolean>(false);
// 修改参数
const updateForm = ref({
  id: "",
  type: 0, // 菜单类型：目录、菜单、按钮
  icon: "", // 菜单图标
  iFrame: false, // 外链菜单
  cache: false, // 菜单缓存
  hidden: true, // 菜单可见1
  title: "", // 菜单标题
  permission: "", // 权限标识
  path: "", // 路由地址
  name: "", // 组件名称
  component: "", // 组件路径
  menuSort: 999, // 菜单排序
  pid: "", // 上级类别
});

// 更换编辑菜单图标
const selectUpdateMenuIcon = (icon: string) => {
  updateForm.value.icon = icon;
  iconListVisable.value = false;
};

// 点击每一行的修改按钮进行修改当前菜单 (填充原本的数据)
const getMenuRowInfo = (row: object) => {
  dialogUpdateTableVisible.value = true;
  updateForm.value = row;
  updateForm.value.cache = updateForm.value.cache === "是" ? true : false;
  updateForm.value.hidden = updateForm.value.hidden === "是" ? true : false;
  updateForm.value.iFrame = updateForm.value.iFrame === "是" ? true : false;
};

// 点击弹窗后修改菜单
const submitFormAndUpdateMenu = async () => {
  await updateMenuAPI(updateForm.value);
  getMenuList();
  dialogUpdateTableVisible.value = false;
  ElMessage({ type: "success", message: "修改成功" });
};

// 保存需要删除的id
const deleteMenuIdList = ref<Array<string>>([]);
// 表格复选框该改变后触发的方法
const updateMenuButtonVisable = ref<boolean>(true);
const deleteMenuButtonVisable = ref<boolean>(true);
const handleSelectionChange = (row: Array<object>) => {
  deleteMenuButtonVisable.value = false;
  if (row.length === 1) {
    updateMenuButtonVisable.value = false;
    // 当选中一个后,为修改菜单弹窗他赋值
    updateForm.value = row[0];
    updateForm.value.cache = updateForm.value.cache === "是" ? true : false;
    updateForm.value.hidden = updateForm.value.hidden === "是" ? true : false;
    updateForm.value.iFrame = updateForm.value.iFrame === "是" ? true : false;
  } else {
    // 只要不是选中一个修改按钮马上改为不可用
    updateMenuButtonVisable.value = true;
  }
  // 每次复选框改变时,先清空id,防止id重复
  deleteMenuIdList.value = [];
  row.forEach((item: object) => {
    deleteMenuIdList.value.push(item.id);
  });
};

// 当复选框只选中一个后可以进行修改
// 复选框变化后,点击删除按钮删除菜单
const deleteMenuList = () => {
  ElMessageBox.confirm(`此操作将删除这些菜单 , 是否继续？`, "Warning", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await deleteMenuAPI(deleteMenuIdList.value);
      getMenuList();
      ElMessage({ type: "success", message: "删除成功" });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消删除",
      });
    });
};

// 递归获取子菜单id
const getSubMenuIdFunction = (data: Array<object>) => {
  if (data) {
    data.forEach((item) => {
      deleteMenuIdList.value.push(item.id);
      item.children ? getSubMenuIdFunction(item.children) : null;
    });
  }
};

// 点击每一行的删除按钮,删除该行菜单
const deleteMenuRowInfo = (row: object) => {
  // 重置deleteMenuIdList的值,防止删除到被复选框选中的菜单
  deleteMenuIdList.value = [];
  deleteMenuIdList.value.push(row.id);
  // 如果是高级菜单,需要得到他子菜单的id
  getSubMenuIdFunction(row.children);
  deleteMenuList();
};

// 导出菜单数据
const exportMenuData = async () => {
  await exportMenuDataAPI()
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
      link.setAttribute("download", `${dateFormat}菜单数据` + ".xlsx");
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
            @click="showAddDialog"
          >
            新增
          </el-button>

          <el-button
            type="success"
            :icon="EditPen"
            style="font-size: 12px"
            :disabled="updateMenuButtonVisable"
            @click="dialogUpdateTableVisible = true"
          >
            修改
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            style="font-size: 12px"
            :disabled="deleteMenuButtonVisable"
            @click="deleteMenuList"
          >
            删除
          </el-button>
          <el-button
            type="warning"
            :icon="Download"
            style="font-size: 12px"
            @click="exportMenuData"
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
          v-loading="tableLoad"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="title" label="菜单标题" align="center" />
          <el-table-column prop="icon" label="图标" align="center">
            <template #default="{ row }">
              <SvgIcon :name="row.icon" color="#a8abb2" />
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
            <template #default="{ row }">
              <el-button
                type="warning"
                :icon="Edit"
                circle
                @click="getMenuRowInfo(row)"
              />
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click="deleteMenuRowInfo(row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <el-dialog
    title="新增菜单"
    v-model="dialogAddTableVisible"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      :model="addForm"
      label-width="100px"
      :inline="true"
      ref="addFomrRef"
      :rules="rules"
    >
      <el-form-item label="菜单类型">
        <el-radio-group v-model="addForm.type">
          <el-radio-button label="目录" :value="0"></el-radio-button>
          <el-radio-button label="菜单" :value="1"></el-radio-button>
          <el-radio-button label="按钮" :value="2"></el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 菜单图标 -->
      <el-form-item
        v-if="addForm.type !== 2"
        label="菜单图标"
        style="width: 100%"
      >
        <el-input
          v-model="addForm.icon"
          placeholder="点击选择图标"
          @focus="iconListVisable = true"
        >
          <template #prefix>
            <SvgIcon
              :name="addForm.icon ? addForm.icon : 'search'"
              color="#a8abb2"
              width="10px"
              height="10px"
            />
          </template>
        </el-input>
        <el-scrollbar
          style="
            max-height: 300px;
            margin-top: 10px;
            width: 100%;
            border: 1px solid #a8abb2;
            border-radius: 5px;
          "
          v-if="iconListVisable"
        >
          <span
            v-for="(item, index) in iconList"
            :key="index"
            class="addIcon"
            @click="selectAddMenuIcon(item)"
          >
            <SvgIcon :name="item" style="display: inline" color="#a8abb2" />
            {{ item }}
          </span>
        </el-scrollbar>
      </el-form-item>

      <!-- 外链菜单 -->
      <el-form-item v-if="addForm.type !== 2" label="外链菜单">
        <el-radio-group v-model="addForm.iFrame">
          <el-radio-button label="是" :value="true"></el-radio-button>
          <el-radio-button label="否" :value="false"></el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 菜单缓存 -->
      <el-form-item v-if="addForm.type === 1" label="菜单缓存">
        <el-radio-group v-model="addForm.cache">
          <el-radio-button label="是" :value="true"></el-radio-button>
          <el-radio-button label="否" :value="false"></el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 菜单可见 -->
      <el-form-item v-if="addForm.type !== 2" label="菜单可见">
        <el-radio-group v-model="addForm.hidden">
          <el-radio-button label="是" :value="true"></el-radio-button>
          <el-radio-button label="否" :value="false"></el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 菜单标题 -->
      <el-form-item label="菜单标题" style="width: 100%" prop="title">
        <el-input v-model="addForm.title" placeholder="菜单标题"></el-input>
      </el-form-item>

      <!-- 权限标识 -->
      <el-form-item v-if="addForm.type !== 0" label="权限标识">
        <el-input
          v-model="addForm.permission"
          placeholder="权限标识"
        ></el-input>
      </el-form-item>

      <!-- 路由地址 -->
      <el-form-item
        v-if="addForm.type !== 2"
        label="路由地址"
        prop="path"
        style="width: 44%"
      >
        <el-input v-model="addForm.path" placeholder="路由地址"></el-input>
      </el-form-item>

      <!-- 组件名称 -->
      <el-form-item v-if="addForm.type === 1" label="组件名称">
        <el-input
          v-model="addForm.name"
          placeholder="匹配组件内Name字段"
        ></el-input>
      </el-form-item>

      <!-- 组件路径 -->
      <el-form-item v-if="addForm.type === 1" label="组件路径">
        <el-input v-model="addForm.component" placeholder="组件路径"></el-input>
      </el-form-item>

      <!-- 菜单排序 -->
      <el-form-item label="菜单排序">
        <el-input-number
          v-model="addForm.menuSort"
          :min="1"
          controls-position="right"
        ></el-input-number>
      </el-form-item>

      <!-- 上级类别 -->
      <el-form-item label="上级类别" style="width: 100%">
        <el-tree-select
          v-model="addForm.pid"
          :data="menuTreeData"
          filterable
          style="width: 240px"
          :render-after-expand="false"
          check-strictly
          :props="{ label: 'label', value: 'id', children: 'children' }"
          placeholder="选择上级类目"
        />
      </el-form-item>
    </el-form>

    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="dialogAddTableVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFormAndAddMenu">确认</el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 修改菜单弹窗 -->
  <el-dialog
    title="编辑菜单"
    v-model="dialogUpdateTableVisible"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      :model="updateForm"
      label-width="100px"
      :inline="true"
      ref="addFomrRef"
      :rules="rules"
    >
      <el-form-item label="菜单类型">
        <el-radio-group v-model="updateForm.type">
          <el-radio-button label="目录" :value="0"></el-radio-button>
          <el-radio-button label="菜单" :value="1"></el-radio-button>
          <el-radio-button label="按钮" :value="2"></el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 菜单图标 -->
      <el-form-item
        v-if="updateForm.type !== 2"
        label="菜单图标"
        style="width: 100%"
      >
        <el-input
          v-model="updateForm.icon"
          placeholder="点击选择图标"
          @focus="iconListVisable = true"
        >
          <template #prefix>
            <SvgIcon
              :name="updateForm.icon ? updateForm.icon : 'search'"
              color="#a8abb2"
              width="10px"
              height="10px"
            />
          </template>
        </el-input>
        <el-scrollbar
          style="
            max-height: 300px;
            margin-top: 10px;
            width: 100%;
            border: 1px solid #a8abb2;
            border-radius: 5px;
          "
          v-if="iconListVisable"
        >
          <span
            v-for="(item, index) in iconList"
            :key="index"
            class="addIcon"
            @click="selectUpdateMenuIcon(item)"
          >
            <SvgIcon :name="item" style="display: inline" color="#a8abb2" />
            {{ item }}
          </span>
        </el-scrollbar>
      </el-form-item>

      <!-- 外链菜单 -->
      <el-form-item v-if="updateForm.type !== 2" label="外链菜单">
        <el-radio-group v-model="updateForm.iFrame">
          <el-radio-button label="是" :value="true"></el-radio-button>
          <el-radio-button label="否" :value="false"></el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 菜单缓存 -->
      <el-form-item v-if="updateForm.type === 1" label="菜单缓存">
        <el-radio-group v-model="updateForm.cache">
          <el-radio-button label="是" :value="true"></el-radio-button>
          <el-radio-button label="否" :value="false"></el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 菜单可见 -->
      <el-form-item v-if="updateForm.type !== 2" label="菜单可见">
        <el-radio-group v-model="updateForm.hidden">
          <el-radio-button label="是" :value="true"></el-radio-button>
          <el-radio-button label="否" :value="false"></el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 菜单标题 -->
      <el-form-item label="菜单标题" style="width: 100%" prop="title">
        <el-input v-model="updateForm.title" placeholder="菜单标题"></el-input>
      </el-form-item>

      <!-- 权限标识 -->
      <el-form-item v-if="updateForm.type !== 0" label="权限标识">
        <el-input
          v-model="updateForm.permission"
          placeholder="权限标识"
        ></el-input>
      </el-form-item>

      <!-- 路由地址 -->
      <el-form-item
        v-if="updateForm.type !== 2"
        label="路由地址"
        prop="path"
        style="width: 44%"
      >
        <el-input v-model="updateForm.path" placeholder="路由地址"></el-input>
      </el-form-item>

      <!-- 组件名称 -->
      <el-form-item v-if="updateForm.type === 1" label="组件名称">
        <el-input
          v-model="updateForm.name"
          placeholder="匹配组件内Name字段"
        ></el-input>
      </el-form-item>

      <!-- 组件路径 -->
      <el-form-item v-if="updateForm.type === 1" label="组件路径">
        <el-input
          v-model="updateForm.component"
          placeholder="组件路径"
        ></el-input>
      </el-form-item>

      <!-- 菜单排序 -->
      <el-form-item label="菜单排序">
        <el-input-number
          v-model="updateForm.menuSort"
          :min="1"
          controls-position="right"
        ></el-input-number>
      </el-form-item>

      <!-- 上级类别 -->
      <el-form-item label="上级类别" style="width: 100%">
        <el-tree-select
          v-model="updateForm.pid"
          :data="menuTreeData"
          filterable
          style="width: 240px"
          :render-after-expand="false"
          check-strictly
          :props="{ label: 'label', value: 'id', children: 'children' }"
          placeholder="选择上级类目"
        />
      </el-form-item>
    </el-form>

    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="dialogUpdateTableVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFormAndUpdateMenu">
          确认
        </el-button>
      </div>
    </template>
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
.custom-tabs ::v-deep {
  box-sizing: border-box;
  font-size: 16px;
  height: 26px;
  margin: 28px 0 0 10px;
}
.custom-tabs ::v-deep .el-tabs__header {
  background-color: #fff;
  color: #000;
}
.custom-tabs ::v-deep .el-tabs__item.is-active {
  color: #fff;
  background-color: #000;
  border-radius: 5px;
  overflow: hidden;
}

.addIcon {
  display: inline-block;
  width: 104px;
  height: 30px;
  margin-left: 40px;
  vertical-align: top;
  cursor: pointer;
  overflow: hidden;
}

.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
