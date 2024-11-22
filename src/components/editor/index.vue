<script setup lang="ts">
import { inject } from "vue";
const isCollapse = inject("isCollapse");
</script>
<template>
  <div class="body" :class="{ left: isCollapse }"></div>
</template>
<style>
.body {
  box-sizing: border-box;
  position: absolute;
  left: 199px;
  top: 80px;
  width: calc(100% - 199px);
  padding: 26px 32px;
}
.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
