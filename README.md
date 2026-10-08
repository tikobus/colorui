# ColorUI for npm (`color-ui`)

> ColorUI 是一个 css 库！引入样式后根据 class 调用组件。本包将其改造为标准 npm 包，**一个包覆盖 Web / 微信小程序 / uni-app 三端**。
>
> Fork 自 [weilanwl/ColorUI](https://github.com/welanwl/ColorUI)，感谢原作者 [文晓港](https://github.com/weilanwl)。样式源码（`src/mp`、`src/uniapp`）保持上游原样镜像，所有 Web 适配在构建期完成。

## 安装

```bash
npm i color-ui
# 或
pnpm add color-ui / yarn add color-ui
```

## Web 使用（Vue / React / 纯 HTML）

构建期已自动完成 Web 适配：`rpx → px`（750 设计稿 ÷2）、小程序标签映射（`view→div`、`text→span`、`image→img`、`navigator→a`）、`page` 拆分为 `:root` + `body`、图标字体 URL https 化。

```js
// 打包器（Vue / React / Vite / webpack）
import 'color-ui'            // 完整版 = main + icon + animation（等价 import 'color-ui/css'）
import 'color-ui/main'       // 仅主样式
import 'color-ui/icon'       // 仅图标字体
import 'color-ui/animation'  // 仅动画
```

```html
<!-- 纯 HTML / CDN（jsDelivr） -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/color-ui/dist/color-ui.min.css">
```

主题色定制（55 个 CSS 变量，覆盖即可）：

```css
:root {
  --red: #e54d42;
  --blue: #0081ff;
  /* ... */
}
```

> 注意：基础字号设置在 `body`（`font-size: 14px`），不会污染你的 rem 基准。

## 微信小程序使用

`package.json` 已声明 `"miniprogram": "dist/mp"`，支持小程序 npm：

1. 在小程序工程根目录 `npm i color-ui`
2. 微信开发者工具 → 工具 → 构建 npm
3. `app.wxss` 引入样式：

```css
@import "/miniprogram_npm/color-ui/main.wxss";
@import "/miniprogram_npm/color-ui/icon.wxss";
```

自定义导航栏组件，`app.json` 全局注册：

```json
"window": { "navigationStyle": "custom" },
"usingComponents": { "cu-custom": "color-ui/components/cu-custom" }
```

`App.js` 获得系统信息：

```js
onLaunch: function() {
  wx.getSystemInfo({
    success: e => {
      this.globalData.StatusBar = e.statusBarHeight;
      let custom = wx.getMenuButtonBoundingClientRect();
      this.globalData.Custom = custom;
      this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
    }
  })
},
```

页面直接调用：

```html
<cu-custom bgColor="bg-gradual-pink" isBack="{{true}}">
  <view slot="backText">返回</view>
  <view slot="content">导航栏</view>
</cu-custom>
```

| 参数 | 作用 | 类型 | 默认值 |
| --- | :----: | :----: | :----: |
| bgColor | 背景颜色类名 | String | '' |
| isBack | 是否开启返回 | Boolean | false |
| isCustom | 是否开启左侧胶囊 | Boolean | false |
| bgImage | 背景图片路径 | String | '' |

| slot 块 | 作用 |
| --- | :----: |
| backText | 返回时的文字 |
| content | 中间区域 |
| right | 右侧区域（小程序端可使用范围很窄！） |

## uni-app 使用

```css
/* App.vue */
<style>
@import "color-ui/uniapp/main.css";
@import "color-ui/uniapp/icon.css";
</style>
```

注册导航栏组件：

```js
// main.js
import cuCustom from 'color-ui/uniapp/components/cu-custom.vue'
Vue.component('cu-custom', cuCustom)
```

```html
<cu-custom bgColor="bg-gradual-blue" :isBack="true">
  <block slot="backText">返回</block>
  <block slot="content">导航栏</block>
</cu-custom>
```

| 参数 | 作用 | 类型 | 默认值 |
| --- | :----: | :----: | :----: |
| bgColor | 背景颜色类名 | String | '' |
| isBack | 是否开启返回 | Boolean | false |
| bgImage | 背景图片路径 | String | '' |

> 系统信息注入（`StatusBar`/`CustomBar`）与取消系统导航栏配置，参考上游 [ColorUI README](https://github.com/weilanwl/ColorUI)。

## 目录结构

```
├── src/            样式真源（上游原样镜像，不发布）
│   ├── mp/         微信小程序版（.wxss + cu-custom 组件）
│   ├── uniapp/     uni-app 版（.css + cu-custom.vue）
│   └── web/        Web 增量补丁（overrides.css，可选）
├── dist/           构建产物（发布内容）
│   ├── color-ui.css / .min.css      Web 合并入口
│   ├── main|icon|animation.css      Web 分模块
│   ├── mp/                           小程序原版（miniprogram 字段指向）
│   └── uniapp/                       uni-app 原版
├── examples/       示例工程（miniprogram-demo / miniprogram-template / uniapp / web）
└── scripts/build.js  构建脚本
```

## 开发

```bash
npm install
npm run build    # 构建 dist/ 并回填 examples/
npm run verify   # build + npm pack --dry-run
```

上游同步：覆盖 `src/mp`、`src/uniapp` 后重跑 `npm run build` 即可，勿手改 `dist/`。

## Known Limitations（Web 端）

- `switch` / `checkbox` / `radio` / `picker` 的部分皮肤依赖微信原生组件内部类（`.wx-*`），Web 上为惰性规则（不生效、无副作用）
- 奇数 rpx 转换为 `0.5px` hairline 边框，需现代浏览器（Chrome 49+ / Safari 9.2+ / Firefox 49+）

## License

[MIT](./LICENSE) — Copyright (c) 2018-present weilanwl（原始项目），Modifications Copyright (c) 2026 tikobus
