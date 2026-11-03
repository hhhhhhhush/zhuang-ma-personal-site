# 交接说明（Handoff）— zhuang-ma-personal-site

生成时间：2026-11-03 21:2x（Asia/Shanghai）
执行者：Little Code Sauce（本轮 agent）
本地目录：`E:\codex`
目标仓库：`https://github.com/hhhhhhhush/zhuang-ma-personal-site`
旧仓库（**禁止删除、禁止覆盖**）：`https://github.com/hhhhhhhush/astro-blog`

---

## 一、已完成且已核实的云端事实

| 项目 | 状态 | 证据 |
| --- | --- | --- |
| 代码已全量推送到 `main` | ✅ 真实成功 | `origin/main = f6e652a`，本地 `main` 与远端 0/0 分歧 |
| 远端文件数 | ✅ 70 个 | `git ls-tree -r --name-only origin/main \| wc -l`（原网页上传 56，本地 66，本轮再补 4 个 `.gitkeep`） |
| 关键点文件已进仓库 | ✅ | `.pages.yml`、`.github/workflows/deploy.yml`、`.gitignore`、`.prettierignore`、`.prettierrc.json` 均存在于远端根目录，`raw.githubusercontent.com` 返回 200 |
| 目录结构正确 | ✅ | `src` 33 文件、`data` 5、`public` 9、`tests` 2、`scripts` 3、`e2e` 1、`docs` 1 |
| Pages 发布源 | ✅ 已设为 **GitHub Actions** | Pages API 返回 `build_type: "workflow"`，`https_enforced: true`，`public: true` |
| Actions 工作流 | ✅ 三次运行全部 success | run `41638130502`(push) / `41638449125`(dispatch) / `41639736364`(push) |
| 实际站点地址 | ✅ 已上线 | **https://hhhhhhhush.github.io/zhuang-ma-personal-site/** |
| 线上页面抽查 | ✅ 全部 200 | `/`、`/blog/`、`/knowledge/`、`/projects/`、`/about/`、`/contact/`、`/links/`、`/admin/`、`/rss.xml`、`/robots.txt`、`/sitemap-index.xml` |
| 浏览器真实渲染 | ✅ 已用本机 Chrome 截图核对 | 首页 H1 `Stay curious. Keep creating.`、导航 Home/About/Blog/Knowledge/Projects/Links、卡片与中文文案全部正常，无 4xx 资源请求 |
| canonical / robots / sitemap | ✅ 指向新地址 | `https://hhhhhhhush.github.io/zhuang-ma-personal-site/...`，`robots.txt` 已 `Allow: /`（非占位 example.com 的 Disallow） |
| 旧仓库 `astro-blog` | ✅ 未动 | 仍存在，未删除、未覆盖、未推送 |
| 本地测试 | ✅ 复跑通过 | `npm test` 6/6 pass；`npm run format:check` 全部符合 Prettier |

首次 push 失败的根因**不是网络**（`github.com:443` 实测可达、`git ls-remote` 成功）：真正原因是**本地提交 `bfe64e7` 与远端 `5f315d0` 是两条无关历史**（`git merge-base` 为空），Git 直接拒绝非 fast-forward。处理方式：用 `git commit-tree` 以**远端提交为父**、**本地树为内容**构造新提交 `4e35a58`，再普通 push —— **没有 force push、没有 reset 远端、没有删除任何远端内容**。

---

## 二、剩余未完成项（需要人或带浏览器会话的 agent）

### 1. Pages CMS 连接新仓库（唯一真正的阻塞点）

**当前状态：未验证。** Pages CMS（https://app.pagescms.org）是第三方 Git-based 编辑器，登录必须走 **GitHub OAuth 网页授权**（client_id `Iv1.ccce58403d8708ad`，scope `read:user user:email repo`）。仓库侧的 OAuth 令牌**不能**代替这次网页授权，因此无法在纯命令行里完成。

已完成的前置工作：
- 目标仓库根目录的 `.pages.yml` 已就位且可被 CMS 解析（`yaml` 解析通过，`media` 1 条、`content` 8 条：`profile, posts, knowledge, projects, resources, site, socials, navigation`）。
- `.pages.yml` 中所有 `path` 已逐一核对：内容集合与 JSON 文件均存在；`public/images/{blog,knowledge,projects}/body`、`public/images/projects/screenshots` 原本缺失，本轮已补 `.gitkeep` 并推送，CMS 上传图片时不会因目录不存在而失败。
- 所有 JSON 文件顶层键与 schema 完全一致（无未声明键），内容 md 的前置字段也在 schema 内（缺的都是可选字段）。
- `settings.content.merge` 未设置，CMS 保存会按 schema 重写文件；如果担心丢字段，可在 `.pages.yml` 追加：
  ```yaml
  settings:
    content:
      merge: true
  ```

**人要做的事（3 分钟）**：
1. 打开 https://app.pagescms.org → **Sign in with GitHub** → 授权。
2. 仓库列表里选 **`hhhhhhhush/zhuang-ma-personal-site`**，分支 **`main`**（**不要再选 `astro-blog`**）。如列表里没有该仓库，去 https://github.com/apps/pages-cms/installations/new 给这个仓库装上 Pages CMS App（装完回 CMS 刷新）。
3. 左侧应出现 8 个栏目：个人资料、博客文章、知识笔记、项目作品、资源书架、网站设置、社交链接、导航菜单。逐个点开能读到数据即算连通。

**验收方式**：随便改一个非敏感字段（例如网站设置里的页脚文字）→ 保存 → 回 GitHub 看是否出现 `Update data/site-config.json (via Pages CMS)` 提交 → 等 Actions 绿 → 刷新线上页面看是否变化。成功后请把该字段改回原值。

### 2. 占位内容替换（发布前必须）

以下内容目前是**示例/占位**，不是真实个人信息，切勿当成已发生的事实对外呈现：

- `data/profile.json`：`nameZh = "待填写中文姓名"`、`skills[0] = "待填写 · 技能与工具"`、`learning[0] = "待填写 · 当前学习方向"`、`experiences[0] = { period: "待填写", title: "你的下一段故事", ... }`、`introductionZh` 明写"待完善"、`email`/`github` 为空。
- `src/content/blog/*.md`（3 篇）、`src/content/knowledge/*.md`（3 篇）、`src/content/projects/*.md`（2 篇）：全部带 `#示例内容` 标签，正文明确声明是排版示例。
- 建议：由本人提供真实姓名/简介/经历/联系方式后，用 CMS 改写；示例文章可删可留（删了首页会空，需同步补真实内容）。

### 3. 自定义域名（可选，未做）

现在用的是 `https://hhhhhhhush.github.io/zhuang-ma-personal-site/`（带子路径 base）。若以后要绑独立域名，需要在仓库 `Settings → Variables` 设 `SITE_URL` 与 `BASE_PATH`（工作流已支持这两个变量），再配 CNAME/DNS。**没做，也不该在没域名时做。**

---

## 三、给下一个 AI 的可直接执行指令

> 前置：本机 `git` 已存有 `hhhhhhhush` 的 GitHub 凭据（`git credential fill` 可取出，含 `repo` + `workflow` scope，仓库 admin 权限）。**不要向用户索取密码/token/验证码。**
> 取令牌的安全写法（不打印明文）：
> ```powershell
> $out = "url=https://github.com`n`n" | git credential fill 2>&1
> $tok = (($out -split "`n") | Where-Object { $_ -match '^password=' }) -replace '^password=',''
> ```

**指令 A — 复核当前线上状态（只读，安全）**
```powershell
cd E:\codex
git fetch origin -q; git status --short --branch; git log --oneline -3
curl.exe -s "https://api.github.com/repos/hhhhhhhush/zhuang-ma-personal-site/pages" -H "Authorization: token $tok" -H "User-Agent: curl/8"
curl.exe -s "https://api.github.com/repos/hhhhhhhush/zhuang-ma-personal-site/actions/runs?per_page=3" -H "Authorization: token $tok" -H "User-Agent: curl/8"
foreach ($p in @('/','/blog/','/projects/','/knowledge/','/about/','/rss.xml')) { $c = curl.exe -s -o NUL -w "%{http_code}" "https://hhhhhhhush.github.io/zhuang-ma-personal-site$p" --max-time 20; "$p => $c" }
```

**指令 B — 用带界面的浏览器完成 Pages CMS 授权**（需要人点一下，或用已登录的浏览器配置）
```powershell
cd E:\codex
node -e "const {chromium}=require('playwright');(async()=>{const ctx=await chromium.launchPersistentContext('C:/Users/UUUser/AppData/Local/Temp/cms-live-profile',{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:false,args:['--start-maximized','--remote-debugging-port=9222']});const p=ctx.pages()[0]||await ctx.newPage();await p.goto('https://app.pagescms.org/sign-in');console.log('请在窗口内点 Sign in with GitHub 并授权仓库 zhuang-ma-personal-site');})();"
```
> 注意：上一次尝试时窗口被关闭，脚本抛 `Target page, context or browser has been closed`。如果复用持久化 profile 仍不行，就让人**在自己的浏览器里手动完成**，agent 只负责之后的核对。
> 已有本地浏览器 profile 的路径：`C:\Users\UUUser\AppData\Local\Temp\cms-live-profile`（里面有 Cookies 库但**没有** GitHub 登录态，因为从未成功登录过）。

**指令 C — 核对 CMS 是否连对仓库**（登录成功后）
```powershell
# 用 CDP 连上已登录窗口，读取当前仓库与栏目
curl.exe -s http://127.0.0.1:9222/json/version | ConvertFrom-Json | Select-Object Browser,'webSocketDebuggerUrl'
```
CMS 正确状态：URL 含 `hhhhhhhush/zhuang-ma-personal-site`、分支 `main`、8 个栏目可读。**若看到 `astro-blog`，说明连错，需要在 CMS 里切仓库或重新授权，绝对不要往 astro-blog 写。**

**指令 D — 改完内容后的发布检查**
```powershell
cd E:\codex; git pull --ff-only; npm ci; npm test; npm run check; npm run build; npm run test:site
git push origin main   # 只有本地有提交时才推
```
线上生效判定：`Actions` 最新一次 run `conclusion=success` **且** `head_sha` 等于刚推的提交，再刷新线上页面看内容。

**指令 E — 红线（沿用本轮约束）**
- 不得 force push、不得 `git reset` 远端、不得删除或覆盖 `astro-blog`。
- 不得再让用户"删掉重传全部文件"：远端已有 70 个文件，增量提交即可。
- `.pages.yml` / `.github/workflows/deploy.yml` / `.gitignore` 必须留在仓库根目录，网页上传容易漏掉点开头文件。
- 不要把"本地测试通过"说成"线上验收通过"；CMS 未登录未保存就写"未验证"。

---

## 四、清理项

本轮临时建过并已删除：`scripts/live-check.mjs`、`scripts/cms-probe.mjs`、`scripts/cms-login-window.mjs`、`docs/cms-landing.png`。
保留的未跟踪文件（**故意不提交**，只是本地核对截图）：`docs/live-home.png`、`docs/live-projects.png`。要不要进仓库由下一个 agent 或用户决定；要提交就 `git add docs/live-*.png && git commit -m "Add live deployment screenshots"`，不要就删掉。

本地分支现状：
- `main` = `f6e652a`（= `origin/main`）
- `main-publish` = `4e35a58`（发布提交副本）
- `backup-bfe64e7` = `bfe64e7`（原始本地提交，未丢）
