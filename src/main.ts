import "./assets/scss/main.scss";

import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPersistedState from "pinia-plugin-persistedstate";
import App from "./App.vue";
import router from "./router";
import "virtual:svg-icons-register";
import gloablComponent from "@/utils/svg";
import * as ElIconModules from "@element-plus/icons-vue";
import VueMarkdownEditor from "@kangc/v-md-editor";
import "@kangc/v-md-editor/lib/style/base-editor.css";
import vuepressTheme from "@kangc/v-md-editor/lib/theme/vuepress.js";
import "@kangc/v-md-editor/lib/theme/style/vuepress.css";
// if you just want to import css
import "element-plus/theme-chalk/dark/css-vars.css";
// 引入 Prism.js（代码高亮库）
import Prism from "prismjs";

const pinia = createPinia();
pinia.use(piniaPersistedState);
VueMarkdownEditor.use(vuepressTheme, { Prism });

const app = createApp(App);
Object.keys(ElIconModules).forEach(function (key) {
  app.component(ElIconModules[key].name, ElIconModules[key]);
});
app.use(VueMarkdownEditor);
app.use(router);
app.use(createPinia());
app.use(pinia);
app.use(gloablComponent);

app.mount("#app");
