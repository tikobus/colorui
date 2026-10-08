# Changelog

本包遵循 [SemVer](https://semver.org/)。版本线延续上游 ColorUI（v2.1.x）。

## [2.1.6] - 2026-10-08

首个 npm 发布（fork 自 [ColorUI](https://github.com/weilanwl/ColorUI)），将"下载源码复制文件夹"的分发方式改造为标准 npm 包。

### 新增

- 标准 npm 包 `color-ui`，一个包三个入口：
  - **Web 版**（`dist/*.css`）：构建期自动完成 rpx→px（750 设计稿 ÷2）、小程序标签映射（`view→div`、`text→span`、`image→img`、`navigator→a` 等）、`page` 规则拆分为 `:root`（CSS 变量）+ `body`（基础样式）、图标字体协议相对 URL 改 https
  - **微信小程序原版**（`dist/mp/`，`miniprogram` 字段已声明，支持开发者工具"构建 npm"）
  - **uni-app 原版**（`dist/uniapp/`）
- `dist/color-ui.css` / `.min.css` 合并入口（main + icon + animation）
- postcss 构建脚本（`scripts/build.js`），`npm run build` 一键构建并回填 examples
- Web 组件全览页 `examples/web/index.html`：21 类组件（颜色/渐变/文本/图标/按钮/标签/头像/进度/阴影/加载/操作条/列表/卡片/表单/时间轴/聊天/轮播/步骤条/导航栏/弹窗/动画），弹窗含普通/底部/对话/图片/侧边抽屉 5 种，附交互 JS

### 工程化

- 移除 git 误收录的 `node_modules`、`.DS_Store`、失效的 `package-lock.json`
- 目录重组：`demo/` → `examples/miniprogram-demo/`，`template/` → `examples/miniprogram-template/`，`Colorui-UniApp/` → `examples/uniapp/`；样式真源迁入 `src/mp`、`src/uniapp`（保持上游原样镜像，零改动）

### 已知限制（Web 端）

- `switch`/`checkbox`/`radio`/`picker` 的部分皮肤依赖微信原生组件内部类（`.wx-*`），在 Web 上为惰性规则，不生效也不会产生副作用
- 奇数 rpx 转换为 `0.5px`（hairline 边框视觉），需现代浏览器（Chrome 49+ / Safari 9.2+ / Firefox 49+）
