
## 前言
ColorUI是一个css库！！！在你引入样式后可以根据class来调用组件，一些含有交互的操作我也有简单写，可以为你开发提供一些思路。

## 使用UniApp开发
### 开始
下载源码解压获得`/Colorui-UniApp`文件夹，复制目录下的 `/colorui` 文件夹到你的项目根目录

`App.vue` 引入关键Css `main.css` `icon.css`
```css
<style>
@import "colorui/main.css";
@import "colorui/icon.css";
@import "app.css"; /* 你的项目css */
....
</style>
```

### 使用自定义导航栏
导航栏作为常用组件有做简单封装，当然你也可以直接复制代码结构自己修改，达到个性化目的。

`App.vue` 获得系统信息
```js
onLaunch: function() {
  uni.getSystemInfo({
    success: function(e) {
      // #ifndef MP
      Vue.prototype.StatusBar = e.statusBarHeight;
      if (e.platform == 'android') {
        Vue.prototype.CustomBar = e.statusBarHeight + 50;
      } else {
        Vue.prototype.CustomBar = e.statusBarHeight + 45;
      };
      // #endif
      // #ifdef MP-WEIXIN
      Vue.prototype.StatusBar = e.statusBarHeight;
      let custom = wx.getMenuButtonBoundingClientRect();
      Vue.prototype.Custom = custom;
      Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      // #endif		
      // #ifdef MP-ALIPAY
      Vue.prototype.StatusBar = e.statusBarHeight;
      Vue.prototype.CustomBar = e.statusBarHeight + e.titleBarHeight;
      // #endif
    }
  })
},
```

`pages.json` 配置取消系统导航栏
```json
"globalStyle": {
  "navigationStyle": "custom"
},
```
复制代码结构可以直接使用，注意全局变量的获取。

使用封装,在`main.js` 引入 `cu-custom` 组件。
```
import cuCustom from './colorui/components/cu-custom.vue'
Vue.component('cu-custom',cuCustom)
```

`page.vue` 页面可以直接调用了
```html
<cu-custom bgColor="bg-gradual-blue" :isBack="true">
  <block slot="backText">返回</block>
  <block slot="content">导航栏</block>
</cu-custom>
```
| 参数       | 作用   |类型    |  默认值 |
| --------   | :----:  |:----:  | :----:  |
| bgColor    | 背景颜色类名 |String  |   ''    |
| isBack     | 是否开启返回 | Boolean |   false |
| bgImage    | 背景图片路径 | String  |  ''     |

| slot块       | 作用   |
| --------   | :----:  |
| backText    | 返回时的文字 | 
| content     | 中间区域 | 
| right    | 右侧区域(小程序端可使用范围很窄！)  | 

## 使用原生小程序开发
### 从现有项目开始 
下载源码解压获得`/demo`，复制目录下的 `/colorui` 文件夹到你的项目根目录

`App.wxss` 引入关键Css `main.wxss` `icon.wxss`
```css
@import "colorui/main.wxss";
@import "colorui/icon.wxss";
@import "app.css"; /* 你的项目css */
....
```

### 从新项目开始
下载源码解压获得`/template`，复制`/template`并重命名为你的项目，导入到小程序开发工具既可以开始你的新项目了

### 使用自定义导航栏
导航栏作为常用组件有做简单封装，当然你也可以直接复制代码结构自己修改，达到个性化目的。

`App.js` 获得系统信息
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

`App.json` 配置取消系统导航栏,并全局引入组件
```json
"window": {
  "navigationStyle": "custom"
},
"usingComponents": {
  "cu-custom":"/colorui/components/cu-custom"
}
```

`page.wxml` 页面可以直接调用了
```html
<cu-custom bgColor="bg-gradual-pink" isBack="{{true}}">
  <view slot="backText">返回</view>
  <view slot="content">导航栏</view>
</cu-custom>

```
| 参数       | 作用   |类型    |  默认值 |
| --------   |:----:  |:----:  | :----:  |
| bgColor    | 背景颜色类名 |String  |   ''    |
| isBack     | 是否开启返回 | Boolean |   false |
| isCustom   | 是否开启左侧胶囊 | Boolean |   false |
| bgImage    | 背景图片路径 | String  |  ''     |

| slot块       | 作用   |
| --------   | :----:  |
| backText    | 返回时的文字 | 
| content     | 中间区域 | 
| right    | 右侧区域(小程序端可使用范围很窄！)  | 

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2020-present, XiaoGang Wen
