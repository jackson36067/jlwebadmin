import "./assets/scss/main.scss";

import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPersistedState from "pinia-plugin-persistedstate";
import App from "./App.vue";
import router from "./router";
import "virtual:svg-icons-register";
import gloablComponent from "@/utils/svg";
import * as ElIconModules from "@element-plus/icons-vue";

const pinia = createPinia();
pinia.use(piniaPersistedState);
const app = createApp(App);
Object.keys(ElIconModules).forEach(function (key) {
  app.component(ElIconModules[key].name, ElIconModules[key]);
});
app.use(createPinia());
app.use(pinia);
app.use(router);
app.use(gloablComponent);

app.mount("#app");
