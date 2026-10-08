#!/usr/bin/env node
/**
 * color-ui 构建脚本
 *
 * 管线：
 *   dist/main.css       ← src/mp/main.wxss      [splitPageRule, mapTags, rpxToPx]
 *   dist/icon.css       ← src/mp/icon.wxss      [httpsFontUrl]
 *   dist/animation.css  ← src/mp/animation.wxss （纯标准 CSS，原样）
 *   dist/color-ui.css   ← main + icon + animation (+ src/web/overrides.css 若存在)
 *   dist/*.min.css      ← cssnano（关闭 calc 折叠，保持 calc(100% - 48px - ...) 语义）
 *   dist/mp/**          ← src/mp/**   原样（微信小程序 npm 入口）
 *   dist/uniapp/**      ← src/uniapp/** 原样
 *   examples 下各 colorui 目录 ← src 同步回填（保持示例工程可直接打开）
 *
 * 约定：src/mp、src/uniapp 是上游原样镜像（零改动），所有 Web 适配在构建期完成。
 */
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const cssnano = require('cssnano');

const ROOT = path.join(__dirname, '..');
const SRC = {
  mp: path.join(ROOT, 'src/mp'),
  uniapp: path.join(ROOT, 'src/uniapp'),
  web: path.join(ROOT, 'src/web'),
};
const DIST = path.join(ROOT, 'dist');
const EXAMPLES = {
  demo: path.join(ROOT, 'examples/miniprogram-demo/colorui'),
  template: path.join(ROOT, 'examples/miniprogram-template/colorui'),
  uniapp: path.join(ROOT, 'examples/uniapp/colorui'),
};

// 小程序标签 → Web 标签映射。
// switch/checkbox/radio/picker 依赖 .wx-* 内部类，映射无意义，保留惰性规则；
// button/input/textarea/label/video 已是标准 HTML 标签，无需处理。
const TAG_MAP = {
  view: 'div',
  text: 'span',
  image: 'img',
  navigator: 'a',
  'scroll-view': 'div',
  swiper: 'div',
  'swiper-item': 'div',
};

/** rpx → px：750 设计稿 → 375px 基准（1rpx = 0.5px）。
 *  奇数 rpx 保留 0.5px（hairline 边框视觉）；walkDecls 天然覆盖
 *  calc() 内嵌、--* 自定义属性值内、@keyframes 内的 rpx。 */
const rpxToPx = {
  postcssPlugin: 'color-ui-rpx-to-px',
  Declaration(decl) {
    if (!decl.value.includes('rpx')) return;
    decl.value = decl.value.replace(
      /(-?\d*\.?\d+)rpx/g,
      (_, n) => String(parseFloat(n) / 2) + 'px'
    );
  },
};

/** 小程序标签选择器 → Web 标签（AST 级替换，避免正则误伤属性选择器）。 */
const mapTags = {
  postcssPlugin: 'color-ui-map-mp-tags',
  Rule(rule) {
    const parent = rule.parent;
    if (parent && parent.type === 'atrule' && parent.name && parent.name.toLowerCase() === 'keyframes') return;
    rule.selector = rule.selector
      .split(',')
      .map((sel) =>
        selectorParser((sp) => {
          sp.walkTags((tag) => {
            if (TAG_MAP[tag.value]) tag.value = TAG_MAP[tag.value];
          });
        }).processSync(sel)
      )
      .join(',');
  },
};

/** `page` 规则拆分：--* 变量 → :root（主题定制入口），
 *  其余样式属性（font-size 等）→ body（避免放 :root 改变 rem 基准）。 */
const splitPageRule = {
  postcssPlugin: 'color-ui-split-page',
  Once(root) {
    root.walkRules('page', (rule) => {
      const varRule = postcss.rule({ selector: ':root' });
      const bodyRule = postcss.rule({ selector: 'body' });
      for (const node of [...rule.nodes]) {
        if (node.type === 'decl' && !node.prop.startsWith('--')) {
          bodyRule.append(node.clone());
        } else {
          varRule.append(node.clone()); // --* 声明与注释
        }
      }
      rule.replaceWith(varRule, bodyRule);
    });
  },
};

/** icon 字体协议相对 URL（//at.alicdn.com）→ https（file:// 与纯 Web 场景）。 */
const httpsFontUrl = {
  postcssPlugin: 'color-ui-https-font-url',
  AtRule: {
    'font-face'(atRule) {
      atRule.walkDecls((decl) => {
        decl.value = decl.value.replace(/url\((['"]?)\/\//g, 'url($1https://');
      });
    },
  },
};

function readSrc(...segments) {
  return fs.readFileSync(path.join(SRC.mp, ...segments), 'utf8');
}

function writeDist(file, content) {
  const target = path.join(DIST, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  return target;
}

function report(file) {
  const size = fs.statSync(path.join(DIST, file)).size;
  console.log(`  dist/${file}  (${(size / 1024).toFixed(1)} KB)`);
}

async function processCss(source, from, plugins) {
  const result = await postcss(plugins).process(source, { from });
  return result.css;
}

async function minify(name, css) {
  const min = await postcss([cssnano({ preset: ['default', { calc: false }] })]).process(
    css,
    { from: `dist/${name}.css`, map: false }
  );
  writeDist(`${name}.min.css`, min.css);
  report(`${name}.min.css`);
}

async function buildWeb() {
  console.log('[1/4] Web 版（dist 根）');
  const mainCss = await processCss(readSrc('main.wxss'), 'src/mp/main.wxss', [
    splitPageRule,
    mapTags,
    rpxToPx,
  ]);
  const iconCss = await processCss(readSrc('icon.wxss'), 'src/mp/icon.wxss', [httpsFontUrl]);
  const animationCss = readSrc('animation.wxss'); // 纯标准 CSS，原样

  writeDist('main.css', mainCss);
  writeDist('icon.css', iconCss);
  writeDist('animation.css', animationCss);
  report('main.css');
  report('icon.css');
  report('animation.css');

  // 合并入口 + 可选 Web 增量补丁
  const overridesPath = path.join(SRC.web, 'overrides.css');
  const overrides = fs.existsSync(overridesPath)
    ? '\n' + fs.readFileSync(overridesPath, 'utf8')
    : '';
  writeDist('color-ui.css', `${mainCss}\n${iconCss}\n${animationCss}${overrides}\n`);
  report('color-ui.css');

  for (const [name, css] of [
    ['main', mainCss],
    ['icon', iconCss],
    ['animation', animationCss],
    ['color-ui', `${mainCss}\n${iconCss}\n${animationCss}${overrides}\n`],
  ]) {
    await minify(name, css);
  }
}

function copyDirs() {
  console.log('[2/4] 小程序原版（dist/mp）与 uniapp 原版（dist/uniapp）');
  fs.cpSync(SRC.mp, path.join(DIST, 'mp'), { recursive: true });
  fs.cpSync(SRC.uniapp, path.join(DIST, 'uniapp'), { recursive: true });
  console.log(`  dist/mp/  (${fs.readdirSync(SRC.mp).join(', ')})`);
  console.log(`  dist/uniapp/  (${fs.readdirSync(SRC.uniapp).join(', ')})`);
}

function syncExamples() {
  console.log('[3/4] 回填 examples（保持示例工程可直接打开）');
  for (const dest of [EXAMPLES.demo, EXAMPLES.template]) {
    fs.rmSync(dest, { recursive: true, force: true });
    fs.cpSync(SRC.mp, dest, { recursive: true });
  }
  fs.rmSync(EXAMPLES.uniapp, { recursive: true, force: true });
  fs.cpSync(SRC.uniapp, EXAMPLES.uniapp, { recursive: true });
  console.log('  examples/miniprogram-demo/colorui, examples/miniprogram-template/colorui, examples/uniapp/colorui');
}

async function main() {
  console.log('[0/4] 清理 dist/');
  fs.rmSync(DIST, { recursive: true, force: true });
  await buildWeb();
  copyDirs();
  syncExamples();
  console.log('[4/4] 完成 ✓');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
