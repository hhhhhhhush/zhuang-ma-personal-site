# Zhuang Ma — 个人数字空间

已在当前项目实现可运行的 Astro 第一版，包括公开网站、结构化内容、真实 Pages CMS 配置和 GitHub Pages 自动部署流程。没有自建假后台，没有虚构经历、邮箱、账号或已完成的真实项目。

## 1. 本地启动

需要 Node.js 22.12 以上版本，推荐 Node.js 24。打开项目目录后运行：

```powershell
npm install
npm run dev
```

访问 `http://127.0.0.1:4321`。停止时在终端按 `Ctrl+C`。另一个终端可以运行：

```powershell
npm test
npm run check
npm run build
npm run test:site
npm run preview
```

`preview` 用于查看 `dist` 中的生产构建。若 `dev` 已占用 4321，预览会选择下一端口，以终端输出为准。

其他可用命令：

```powershell
npm run test:e2e         # 使用已安装的 Google Chrome 做真实浏览器测试
npm run test:integration # 临时建立验收内容，测试编辑→构建→删除→恢复
npm run format:check
npm run format
npm run generate:social # 从 SVG 生成分享用 PNG
```

浏览器测试默认使用 Chrome；其他机器需安装 Chrome，或修改 `playwright.config.ts` 中的 `channel`，使用 `npx playwright install chromium` 后测试 Chromium。集成测试会暂时更改个人资料并创建唯一命名的测试内容，结束时恢复文件并重建，不要与内容编辑或另一个构建同时运行。

## 2. 页面与能力

| 路径                 | 内容                                                    |
| -------------------- | ------------------------------------------------------- |
| `/`                  | 个人介绍、精选文章、精选项目、知识入口                  |
| `/about/`            | 个人资料、头像、经历时间线、兴趣与学习方向              |
| `/blog/`             | 时间倒序列表、本地搜索、分类、标签、分页                |
| `/blog/[slug]/`      | Markdown 正文、目录、阅读进度、更新时间、相邻及相关文章 |
| `/knowledge/`        | 独立的知识花园、主题分类、成熟度、搜索与标签            |
| `/knowledge/[slug]/` | 知识笔记详情及目录                                      |
| `/projects/`         | 项目状态、技术栈、精选、排序                            |
| `/projects/[slug]/`  | 项目详情、截图、真实仓库和演示链接（填写后显示）        |
| `/links/`            | 分类资源、推荐与可上传的 Logo                           |
| `/contact/`          | 用户主动填写后的公开联系方式，不使用假表单              |
| `/admin/`            | 真实 Pages CMS 登录入口和安全说明，不是静态 Dashboard   |
| `/rss.xml`           | 已公开博客的 RSS                                        |
| `/404.html`          | 自定义 404                                              |

全站支持移动端布局、键盘导航、跳过导航、可见焦点、系统/手动深浅主题、减少动效偏好。搜索和分页在浏览器本地执行，不发送查询给第三方。不开启 JavaScript 时仍可查看全部公开内容。

个人介绍来自 JSON；真实经历、邮箱和 GitHub 未提供，因此保持明确占位或留空。现有文章、笔记、项目均为示例，公开使用前请替换或删除。

## 3. 文件结构

```text
.github/workflows/deploy.yml   自动检查、构建、发布
.pages.yml                    Pages CMS 配置
data/
  profile.json                姓名、头像、介绍、联系方式、兴趣、经历
  site-config.json            名称、SEO、主题、默认图片与分类导航
  social-links.json           公开社交链接
  navigation.json             导航
  resources.json              资源书架
src/
  content.config.ts           Astro 内容校验
  content/blog/               独立 Markdown 博客
  content/knowledge/          独立 Markdown 知识笔记
  content/projects/           独立 Markdown 项目
  components/                 可复用公共组件
  layouts/                    布局与正文模板
  pages/                      所有路由
  styles/global.css           主题、排版、响应式设计
  lib/                        内容读取、验证、搜索与路径工具
public/
  images/avatar/              头像
  images/blog/                封面与正文图片
  images/knowledge/           知识图片
  images/projects/            项目封面与截图
  images/resources/           资源 Logo
  images/site/                站点图片
scripts/                      构建产物、内容往返检查及分享图生成
tests/                        搜索、分页、路径、CMS 配置测试
e2e/                          浏览器端到端测试
docs/ACCEPTANCE.md             验收与尚待授权的清单
```

## 4. 创建仓库并部署 GitHub Pages

尚未创建任何远程仓库、推送文件或修改你的 GitHub 设置，因为未提供账号、目标仓库和授权。你可以选择：

- **个人主页仓库**：`你的用户名.github.io`，网站发布在根路径。
- **其他名称仓库**：网站通常位于 `https://你的用户名.github.io/仓库名/`，本项目会自动处理 base。

将整个项目（包含 `.pages.yml`、`.github`、`package-lock.json`）推送到 `main`。首次上传可在你自己的终端操作；下面的 URL 必须替换为真实仓库：

```powershell
git init
git add .
git commit -m "Build personal digital space"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

然后：

1. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
2. 检查 Actions 是否允许执行。若分支不叫 `main`，调整工作流触发分支。
3. 在 **Actions** 页查看 `Build and deploy`；首次也可手动执行 `Run workflow`。
4. 等待检查、构建和部署全部成功，再打开 Pages 提供的地址。

构建 job 只有仓库读取和 Pages 配置读取权限；部署 job 才有 `pages: write` 与 `id-token: write`。构建或检查失败不会进入部署。不会把任何 GitHub Token 注入公开前端。

默认按仓库所有者和名称推导 `site` 与 `base`。需要覆盖时，在仓库 **Settings → Secrets and variables → Actions → Variables** 设置：

| 变量        | 值                                                                    |
| ----------- | --------------------------------------------------------------------- |
| `SITE_URL`  | 真实站点 origin，例如 `https://your-name.github.io`，不要附加仓库目录 |
| `BASE_PATH` | 根站用 `/`，项目站用 `/repository/`                                   |

本地默认 `site` 为 `https://example.com`，仅作明确的配置占位，且 robots 会禁止抓取该占位站点。正式工作流会使用真实仓库域名。

本地模拟子目录：

```powershell
$env:SITE_URL="https://your-name.github.io"
$env:BASE_PATH="/repository/"
npm run build
npm run preview
```

恢复默认时：`Remove-Item Env:SITE_URL, Env:BASE_PATH`。

## 5. 登录 Pages CMS

进入 [Pages CMS](https://app.pagescms.org)，用你的 GitHub 账号登录，仅向目标仓库授权，选择目标仓库及 `main` 分支。CMS 会读取根目录 `.pages.yml`，显示个人资料、博客、知识、项目、资源、网站设置等编辑区。

这是 Pages CMS 提供的真实 Git-based 编辑器，不由本地 `npm run dev` 托管。没有仓库授权时，本地无法替你执行登录、上传、写入、删除和 GitHub Actions 云端往返。相关状态见验收文档。

若仓库有分支保护，CMS 直接保存可能被拒绝。建议使用内容分支编辑，按仓库规则发 PR 并人工合并到 `main`；合并后才触发本站部署。不要为了绕过规则向所有人开放写权限。

## 6. 修改头像和个人资料

在 **个人资料**：

1. 修改中文名、英文名、首页标题和副标题、简介与介绍。
2. 在头像字段上传图片，CMS 会写入 `public/images/avatar`，前台使用 `/images/avatar/...` 路径。
3. 填写公开邮箱、完整 GitHub URL；不想公开可以留空。
4. 编辑技能、兴趣、关注领域、学习方向及经历时间线。
5. 保存，确认 GitHub commit 与 Actions 成功。内容更新不是实时数据库更新，而是重新构建后生效。

网站名称、Logo、favicon、默认头像、默认 SEO、分享图、分类导航、主题和页脚在 **网站设置**；其他社交账号在 **社交链接**。访客自行切换的主题会覆盖站点默认设置。

## 7. 写文章、上传图片与发布

在 **博客文章** 新建条目：

1. 填写标题、摘要、分类、标签、发布日期。
2. 使用富文本编辑器写作，必要时切到 Markdown 源码模式。
3. 通过封面或编辑器图片按钮上传图片。项目采用一个媒体源加分类子目录，不需要手写 base 前缀。
4. 保持 `draft` 保存草稿；人工确认后改为 `published`。
5. 如需下架，改为 `unlisted` 或 `draft`。本项目的 `unlisted` 意为**不生成公开详情**，不是“知道链接就可以访问”。
6. 点击保存，等待 Actions 成功发布。

只有 `published` 且日期不晚于构建时刻的内容会出现在公开站点、详情、RSS 和 sitemap 中。未来日期不会在到时后自动刷新静态站；到时需要一次推送或手动运行 Actions。没有配置隐含的定时任务。

正文支持标题层级、链接、代码块语法高亮、行内代码、表格、引用和图片；数学公式和 MDX 未作为第一版必需功能引入。知识笔记额外有 Seedling/Growing/Evergreen 成熟度；项目额外有 Planning/In Progress/Completed/Archived 状态、截图、排序、起止日期和真实链接。

新增知识分类可直接在笔记中填写新分类，也可在网站设置的分类导航中维护；分类由内容自动合并显示。资源分类同理。

推荐使用 WebP/AVIF，控制上传尺寸与文件体积；公共目录图片不做后台自动转码。列表图片有延迟加载和固定布局尺寸，正文可独立上传。Astro 构建资源有哈希文件名；GitHub Pages 的响应缓存头由平台控制，仓库无法任意配置服务器缓存。

## 8. 独立域名

确定真实域名后：

1. 按 GitHub Pages 文档设置域名 DNS，并在 Pages 设置填写 Custom domain、启用 HTTPS。
2. 创建 `public/CNAME`，内容仅为真实域名，例如 `www.your-domain.com`。
3. 设置仓库变量 `SITE_URL=https://www.your-domain.com` 和 `BASE_PATH=/`。
4. 重新运行 Actions，并检查 canonical、RSS、sitemap 和图片路径。

没有预置假域名或 CNAME。

## 9. 安全与未来扩展

**草稿不公开展示，不等于草稿内容私密。** 公开 Git 仓库的文件和提交历史仍可能被访问。不要提交 Token、私人笔记、对话、个人隐私或未授权资料，不要在公开媒体目录上传私密图片。

未来私有 AI 知识库必须使用独立权限边界，通过人工审阅和明确授权后才导出公开 Markdown；本项目没有自动同步私有内容的机制。中英文切换、评论、统计、收藏、会员和 AI 助手均属于未来扩展，没有混入第一版验收。
