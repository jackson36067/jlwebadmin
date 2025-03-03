<script setup lang="ts">
import svgIcon from "@/components/svg/svgIcon.vue";
import { inject, onMounted, ref } from "vue";
import * as echarts from "echarts";
import { useTransition } from "@vueuse/core";

// 是否折叠左侧菜单
const isCollapse = inject("isCollapse", ref(false));

// 保存图标颜色的对象
const svgColors = ref({
  visit: "#40c9c6",
  message: "#36a3f7",
  purchases: "#f4516c",
  shopping: "#34bfa3",
});

// 改变颜色的函数
const changeSvgColor = (key: string) => {
  svgColors.value[key] = "#fff"; // 改为白色
};
// 将颜色改回
const reChangeSvgColor = (key: string) => {
  const defaultColors = {
    visit: "#40c9c6",
    message: "#36a3f7",
    purchases: "#f4516c",
    shopping: "#34bfa3",
  };
  svgColors.value[key] = defaultColors[key]; // 恢复到默认颜色
};

// 定义echart折线图
const lineChart = ref(null);
let LineChart = null;
onMounted(() => {
  LineChart = echarts.init(lineChart.value);
  const options = {
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        let result = params[0].axisValue + "<br/>";
        params.forEach((item) => {
          result += `${item.marker} ${item.seriesName}: ${item.data} <br/>`;
        });
        return result;
      },
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      textStyle: {
        color: "#ffffff", // 设置字体颜色为白色
        fontSize: 14, // 设置字体大小
        fontFamily: "Arial", // 设置字体
      },
    },
    legend: {
      data: ["expected", "actual"],
      top: "5%", // 控制图例的位置
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLine: {
        show: true, // 确保显示 X 轴线
        lineStyle: {
          color: "#008acd", // X 轴线颜色
        },
      },
      axisLabel: {
        color: "#008acd", // X 轴字体颜色
      },
    },
    yAxis: {
      type: "value",
      data: [0, 30, 60, 120, 150, 180],
      axisLine: {
        show: true, // 确保显示 Y 轴线
        lineStyle: {
          color: "#008acd", // Y 轴线颜色
        },
      },
      axisLabel: {
        color: "#008acd", // Y 轴字体颜色
      },
    },
    series: [
      {
        name: "expected",
        type: "line",
        data: [100, 120, 161, 134, 105, 160, 165],
        smooth: true, // 平滑曲线
        itemStyle: {
          color: "#ff005a", // 点的颜色
        },
        emphasis: {
          focus: "series",
        },
      },
      {
        name: "actual",
        type: "line",
        data: [120, 82, 91, 154, 162, 140, 145],
        smooth: true,
        itemStyle: {
          color: "#3888fa",
        },
        emphasis: {
          focus: "series",
        },
        areaStyle: {
          color: "#f4f8fd", // 阴影背景颜色（渐变色或透明色）
        },
      },
    ],
    grid: {
      left: "3%", // 左侧留白
      right: "3%", // 右侧留白
      bottom: "16%", // 下侧留白
      top: "16%", // 上侧留白
    },
  };
  LineChart.setOption(options);

  // 监测页面变化改变echart图标大小;
  window.addEventListener("resize", () => {
    LineChart.resize();
  });
});

// 定义雷达图
const radar = ref(null);
onMounted(() => {
  const rodarEchart = echarts.init(radar.value);
  const option = {
    // tooltip: {
    //   trigger: "item",
    // },
    legend: {
      bottom: "2%",
      data: ["Allocated Budget", "Expected Spending", "Actual Spending"],
      textStyle: {
        color: "#333",
      },
    },
    radar: {
      radius: "56%",
      indicator: [
        { name: "Sales", max: 100 },
        { name: "Administration", max: 100 },
        { name: "Marketing", max: 100 },
        { name: "Customer Support", max: 100 },
        { name: "Development", max: 100 },
        { name: "Information Technology", max: 100 },
      ],
      shape: "polygon",
      splitArea: {
        areaStyle: {
          color: ["rgba(202, 194, 204,1)", "rgba(202, 194, 204,1)"],
        },
      },
    },
    series: [
      {
        name: "Budget vs Spending",
        type: "radar",
        // 不透明的区域颜色
        areaStyle: {
          normal: {
            opacity: 1, // 设置为不透明（值在 0 到 1 之间，0 为完全透明，1 为完全不透明）
          },
        },
        data: [
          {
            value: [60, 70, 50, 80, 60, 90],
            name: "Allocated Budget",
            areaStyle: { color: "rgba(90, 177, 239,1)" },
            itemStyle: {
              color: "rgba(90, 177, 239,1)",
            },
          },
          {
            value: [40, 60, 70, 50, 70, 60],
            name: "Expected Spending",
            areaStyle: { color: "rgba(168, 150, 205,1)" },
            itemStyle: {
              color: "rgba(168, 150, 205,1)",
            },
          },
          {
            value: [70, 80, 60, 90, 80, 70],
            name: "Actual Spending",
            areaStyle: { color: "rgba(46, 197, 199,1)" },
            itemStyle: {
              color: "rgba(46, 197, 199,1)",
            },
          },
        ],
        // 关闭取值处的圆点
        symbol: "none",
      },
    ],
    // 控制图表的留白
    // grid: {
    //   left: "16%", // 左侧留白
    //   right: "16%", // 右侧留白
    //   bottom: "10%", // 下侧留白
    //   top: "10%", // 上侧留白
    // },
  };
  rodarEchart.setOption(option);
  // 监测页面变化改变echart图标大小;
  window.addEventListener("resize", () => {
    rodarEchart.resize();
  });
});

// 玫瑰图
const pie = ref(null);
onMounted(() => {
  const pieChart = echarts.init(pie.value);
  const option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      // orient: "vertical", // 设置排列方式(横向,纵向)
      left: "center", // 水平居中
      bottom: "6px", // 距离底部20px
      data: ["Industries", "Technology", "Forex", "Gold", "Forecasts"],
    },
    series: [
      {
        type: "pie",
        radius: [10, 100],
        roseType: "area",
        center: ["50%", "50%"],
        itemStyle: {
          borderRadius: 4,
        },
        data: [
          {
            value: 320,
            name: "Industries",
            itemStyle: {
              color: "#2ec7c9",
            },
          },
          {
            value: 240,
            name: "Technology",
            itemStyle: {
              color: "#b6a2de",
            },
          },
          {
            value: 149,
            name: "Forex",
            itemStyle: {
              color: "#5ab1ef",
            },
          },
          {
            value: 100,
            name: "Gold",
            itemStyle: {
              color: "#ffb980",
            },
          },
          {
            value: 59,
            name: "Forecasts",
            itemStyle: {
              color: "#d87a80",
            },
          },
        ],
      },
    ],
  };
  pieChart.setOption(option);
  // 监测页面变化改变echart图标大小;
  window.addEventListener("resize", () => {
    pieChart.resize();
  });
});

// 堆叠柱状图
const stack = ref(null);
onMounted(() => {
  const stackEchart = echarts.init(stack.value);
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        let result = params[0].axisValue + "<br/>";
        params.forEach((item) => {
          result += `${item.marker} ${item.seriesName}: ${item.data} <br/>`;
        });
        return result;
      },
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      textStyle: {
        color: "#ffffff", // 设置字体颜色为白色
        fontSize: 14, // 设置字体大小
        fontFamily: "Arial", // 设置字体
      },
    },
    xAxis: {
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLine: {
        show: true, // 确保显示 X 轴线
        lineStyle: {
          color: "#008acd", // X 轴线颜色
        },
      },
      axisLabel: {
        color: "#008acd", // X 轴字体颜色
      },
    },
    yAxis: {
      type: "value",
      data: [0, 200, 400, 600, 800, 1000, 1200],
      axisLine: {
        show: true, // 确保显示 X 轴线
        lineStyle: {
          color: "#008acd", // X 轴线颜色
        },
      },
      axisLabel: {
        color: "#008acd", // X 轴字体颜色
      },
    },
    series: [
      {
        data: [79, 52, 200, 334, 390, 330, 220],
        type: "bar",
        stack: "x",
        itemStyle: {
          color: "#5ab1ef",
        },
        name: "pageA",
      },
      {
        data: [80, 52, 200, 334, 390, 330, 220],
        type: "bar",
        stack: "x",
        itemStyle: {
          color: "#b6a2de",
        },
        name: "pageB",
      },
      {
        data: [30, 52, 200, 334, 390, 330, 220],
        type: "bar",
        stack: "x",
        itemStyle: {
          color: "#2ec7c9",
        },
        name: "pageC",
      },
    ],
    grid: {
      top: "10%",
      bottom: "9%",
      left: "12%",
      right: "6%",
    },
  };
  stackEchart.setOption(option);
  // 监测页面变化改变echart图标大小;
  window.addEventListener("resize", () => {
    stackEchart.resize();
  });
});

// onBeforeUnmount(() => {
//   // 在组件销毁前，销毁 ECharts 实例
//   if (LineChart) {
//     LineChart.dispose();
//   }
// });

const visitValue = ref(0);
const visitOutputValue = useTransition(visitValue, {
  duration: 1500,
});
visitValue.value = 102400;

const messageValue = ref(0);
const messageOutputValue = useTransition(messageValue, {
  duration: 1500,
});
messageValue.value = 81212;

const purchasesValue = ref(0);
const purchaseOutputValue = useTransition(purchasesValue, {
  duration: 1500,
});
purchasesValue.value = 9280;

const shoppingValue = ref(0);
const shoppingOutputValue = useTransition(shoppingValue, {
  duration: 1500,
});
shoppingValue.value = 13600;
</script>
<template>
  <div class="body" :class="{ left: isCollapse }">
    <div class="main">
      <div class="panel-group">
        <div
          class="panel panel-visit"
          @mouseenter="changeSvgColor('visit')"
          @mouseleave="reChangeSvgColor('visit')"
        >
          <!-- 用户图标背景颜色变化 -->
          <div class="svg-bgc-icon">
            <div class="svg-icon">
              <svg-icon
                name="peoples"
                :color="svgColors.visit"
                width="48px"
                height="48px"
              />
            </div>
          </div>
          <div class="panel-description">
            <span class="panel-text">New Visits</span>
            <span class="panel-num"
              ><el-statistic
                :value-style="{
                  color: '#666',
                  fontSize: '20px',
                  fontWeight: 700,
                }"
                :value="visitOutputValue"
            /></span>
          </div>
        </div>
        <div
          class="panel panel-message"
          @mouseenter="changeSvgColor('message')"
          @mouseleave="reChangeSvgColor('message')"
        >
          <div class="svg-bgc-icon">
            <!-- 用户图标背景颜色变化 -->
            <div class="svg-icon">
              <svg-icon
                name="message"
                :color="svgColors.message"
                width="48px"
                height="48px"
              />
            </div>
          </div>
          <div class="panel-description">
            <span class="panel-text">Messages</span>
            <span class="panel-num">
              <el-statistic
                :value-style="{
                  color: '#666',
                  fontSize: '20px',
                  fontWeight: 700,
                }"
                :value="messageOutputValue"
              />
            </span>
          </div>
        </div>
        <div
          class="panel panel-purchase"
          @mouseenter="changeSvgColor('purchases')"
          @mouseleave="reChangeSvgColor('purchases')"
        >
          <div class="svg-bgc-icon">
            <!-- 用户图标背景颜色变化 -->
            <div class="svg-icon">
              <svg-icon
                name="money"
                :color="svgColors.purchases"
                width="48px"
                height="48px"
              />
            </div>
          </div>
          <div class="panel-description">
            <span class="panel-text">Purchases</span>
            <span class="panel-num">
              <el-statistic
                :value-style="{
                  color: '#666',
                  fontSize: '20px',
                  fontWeight: 700,
                }"
                :value="purchaseOutputValue"
              />
            </span>
          </div>
        </div>
        <div
          class="panel panel-shopping"
          @mouseenter="changeSvgColor('shopping')"
          @mouseleave="reChangeSvgColor('shopping')"
        >
          <div class="svg-bgc-icon">
            <!-- 用户图标背景颜色变化 -->
            <div class="svg-icon">
              <svg-icon
                name="shopping"
                :color="svgColors.shopping"
                width="48px"
                height="48px"
              />
            </div>
          </div>
          <div class="panel-description">
            <span class="panel-text">Shoppings</span>
            <span class="panel-num"
              ><el-statistic
                :value-style="{
                  color: '#666',
                  fontSize: '20px',
                  fontWeight: 700,
                }"
                :value="shoppingOutputValue"
            /></span>
          </div>
        </div>
      </div>
      <div class="chart">
        <div class="line-chart" ref="lineChart"></div>
      </div>
      <div class="charts">
        <div ref="radar"></div>
        <div ref="pie"></div>
        <div ref="stack"></div>
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
  padding: 46px 32px;
  background-color: #f0f2f5;
  .main {
    display: flex;
    flex-direction: column;
    .panel-group {
      display: flex;
      .panel {
        display: flex;
        flex: 1;
        // 两边分
        justify-content: space-between;
        // 侧轴居中对齐
        align-items: center;
        height: 108px;
        background-color: #fff;
        margin-right: 20px;
        cursor: pointer;
        .svg-bgc-icon {
          width: 75px;
          height: 75px;
          // background-color: #fff;
          margin-left: 30px;
          text-align: center;
          line-height: 75px;
          border-radius: 5px;
          transition: background-color 0.5s;
          .svg-icon {
            width: 48px;
            height: 48px;
            margin-top: 14px;
            margin-left: 14px;
          }
        }
        .panel-description {
          display: flex;
          flex-direction: column;
          margin-right: 15px;
          .panel-text {
            color: rgba(0, 0, 0, 0.45);
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 12px;
          }
          .panel-num {
            // color: #666;
            font-size: 20px;
            font-weight: 700;
          }
        }
        &:last-child {
          margin-right: 0;
        }
      }

      .panel-visit:hover .svg-bgc-icon {
        background-color: #40c9c6;
      }
      .panel-message:hover .svg-bgc-icon {
        background-color: #36a3f7;
      }
      .panel-purchase:hover .svg-bgc-icon {
        background-color: #f4516c;
      }
      .panel-shopping:hover .svg-bgc-icon {
        background-color: #34bfa3;
      }
    }
    .chart {
      display: flex;
      height: 366px;
      margin: 40px 0 32px 0;
      .line-chart {
        flex: 1;
        background-color: #fff;
      }
    }
    .charts {
      display: flex;
      height: 316px;
      justify-content: space-between;
      div {
        flex: 1;
        background-color: #fff;
        margin-right: 40px;
        &:last-child {
          margin-right: 0;
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
