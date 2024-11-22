<script setup lang="ts">
import { inject, ref } from "vue";

const isCollapse = inject("isCollapse", ref(false));
</script>
<template>
  <div class="footer" :class="{ updateWidth: isCollapse }">
    <span>© 2018-2022 Jackson </span>
    <a href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank">
      Apache License 2.0
    </a>
  </div>
</template>
<style scoped lang="scss">
.footer {
  position: fixed;
  box-sizing: border-box;
  // position: absolute;
  bottom: 0;
  left: 199px;
  width: calc(100% - 199px);
  height: 33px;
  border-top: 1px solid #e7eaec;
  background-color: #fff;
  font-size: 12px;
  color: #7a8b9a;
  padding: 10px 6px 0 6px;
  letter-spacing: 0.8px;
  font-family: Arial, sans-serif !important;
  a {
    color: #7a8b9a;
  }
}
.updateWidth {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
