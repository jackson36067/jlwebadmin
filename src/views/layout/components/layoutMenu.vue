<script setup lang="ts">
import { inject, ref } from "vue";

const isCollapse = inject("isCollapse", ref(false));
</script>
<template>
  <div class="menu-tap" :class="{ updateWidth: isCollapse }">
    <span class="menu">首页</span>
  </div>
</template>
<style scoped lang="scss">
.menu-tap {
  position: absolute;
  top: 50px;
  left: 199px;
  width: calc(100% - 199px);
  height: 30px;
  box-shadow: 0 2px #dadcdf;
  .menu {
    display: inline-block;
    height: 26px;
    line-height: 26px;
    padding: 0 8px;
    font-size: 12px;
    border: 1px solid #d8dce5;
    color: #fff;
    background-color: #42b983;
    margin: 2px 0 0 15px;
    cursor: pointer;
    &::before {
      display: inline-block;
      content: "";
      background-color: #fff;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
    }
  }
}
.updateWidth {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
