import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
    rules: {
      "vue/multi-word-component-names": 0, // 不再强制要求组件命名
    },
  },

  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"],
    rules: {
      "vue/multi-word-component-names": 0, // 不再强制要求组件命名
    },
  },

  ...pluginVue.configs["flat/essential"],
  ...vueTsEslintConfig(),
];
