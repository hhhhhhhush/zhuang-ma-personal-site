# 交接说明（Handoff）— zhuang-ma-personal-site

更新时间：2026-11-04 00:25（Asia/Shanghai）
当前提交：`bc5b994`（本地 = `origin/main`，0/0 分歧）
本地目录：`E:\codex`
线上地址：**https://hhhhhhhush.github.io/zhuang-ma-personal-site/**
仓库：`https://github.com/hhhhhhhush/zhuang-ma-personal-site`
旧仓库（**只读、禁止覆盖**）：`https://github.com/hhhhhhhush/astro-blog`

---

## 一、一句话现状

**网站已经做完了，能正常访问，也能在网页后台改内容。** 剩下的只是「把示例文字换成你自己的话」，不急，随时改。

---

## 二、三个 AI 各做了什么（按时间顺序）

| 阶段 | 谁                | 做了什么事                                                              | 留下的东西                                           |
| ---- | ----------------- | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| 1    | Codex             | 写代码：搭站点、写页面、配部署流程                                      | `src/`、`.github/workflows/deploy.yml`、`.pages.yml` |
| 2    | DSH               | 把代码推到 GitHub、打开 Pages、修好首次推送的历史冲突                   | 4 次成功的 Actions 构建、站点首次上线                |
| 3    | WorkBuddy（本轮） | 接通网页后台（Pages CMS）、修好「后台一保存就构建失败」的 bug、填上真名 | 提交 `4b44683`、`e66771d`、`bc5b994`                 |

> 说明：第 2 阶段曾把「后台连接」列为未完成项，本轮已完成并验证。

---

## 三、你现在能做什么（不需要懂技术）

### 3.1 改网站内容

打开 **https://app.pagescms.org/hhhhhhhush/zhuang-ma-personal-site/main**

左侧 8 个栏目，点进去改，改完按保存即可：

| 栏目     | 对应文件                 | 改什么                       |
| -------- | ------------------------ | ---------------------------- |
| 个人资料 | `data/profile.json`      | 姓名、简介、技能、经历、邮箱 |
| 博客文章 | `src/content/blog/`      | 3 篇（目前是示例）           |
| 知识笔记 | `src/content/knowledge/` | 3 篇（目前是示例）           |
| 项目作品 | `src/content/projects/`  | 2 篇（目前是示例）           |
| 资源书架 | `data/resources.json`    | 常用网站收藏                 |
| 网站设置 | `data/site-config.json`  | 站名、页脚、主题             |
| 社交链接 | `data/social-links.json` | GitHub、邮箱等               |
| 导航菜单 | `data/navigation.json`   | 顶部菜单项                   |

保存后约 40 秒自动发布，刷新线上页面即可看到，**不需要找人、不需要跑命令**。

### 3.2 关键提醒

- 保存时如果页面提示成功，但线上没变化，等 1 分钟再看（构建需要时间）。
- **不要**打开 `app.pagescms.org/hhhhhhhush/**astro-blog**/...` 那个地址，那是旧仓库，改了不会影响这个站。
- 后台现在可以清空任意字段而不会导致构建失败（本轮已修复）。

---

## 四、还剩什么没填

| 位置                                | 当前内容                                  | 建议                                             |
| ----------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| `profile.json` → `skills`           | 「待填写 · 技能与工具」                   | 填真实技能，如「Python / 数据分析 / 写作」       |
| `profile.json` → `learning`         | 「待填写 · 当前学习方向」                 | 填最近在学什么                                   |
| `profile.json` → `experiences`      | 「你的下一段故事」                        | 填真实经历；没有就删掉这一条                     |
| `profile.json` → `introductionZh`   | 「这是一份待完善的个人介绍……」            | 写两三句自我介绍                                 |
| `profile.json` → `email` / `github` | 空                                        | 想公开就填，不想公开就留空（已支持）             |
| 8 篇示例文章                        | 都带 `#示例内容` 标签，正文声明是排版示例 | 可改写、可删除；全删会让首页变空，需同步补新内容 |

> 这些都能在后台自己改，不需要 AI 参与。

---

## 五、技术备忘（给下一个 AI）

### 5.1 当前状态（已核实）

| 项目          | 值                                                              |
| ------------- | --------------------------------------------------------------- |
| `origin/main` | `bc5b994`                                                       |
| Pages 发布源  | GitHub Actions（`build_type: workflow`）                        |
| 最近构建      | run `41672649026`，`success`                                    |
| 线上页面      | 8 个路径全部 200                                                |
| 后台          | Pages CMS 已连通，8 个集合可读写，写入带 `(via Pages CMS)` 后缀 |

### 5.2 本轮修复的 bug（重要，勿回退）

**现象**：在 Pages CMS 里保存 `profile.json` 后，GitHub Actions 的 `Build` 步骤失败，退出码 1。

**根因**：Pages CMS 保存 JSON 时会**丢弃值为空字符串的键**。原本 `email`、`github` 是空串，保存后这两个键整个消失，而 `src/lib/content.ts` 把它们声明为必填，导致 zod 校验抛错：

```
path: ["github"], expected string, received undefined
```

**修复**：`src/lib/content.ts` 中 `profile`、`site`、`socials`、`resources`、`navigation` 五个 schema 的所有字段改为带默认值（`.default('')` / `.default([])`），缺省时回落空值，由页面自行判断是否渲染。已加注释说明原因。

**验证**：本地构建 17 页通过、`npm test` 6/6、`test:site` 11 项通过、Prettier 合规。

### 5.3 环境坑

| 坑        | 说明                                                                                               | 解法                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Node 版本 | 本机 `22.22.2`，Astro 要求 `>=22.23.4`，直接 `npm run build` 会被拒                                | 升级 Node；或用临时 shim 覆盖 `process.versions.node`（本轮用法，用完即删）                       |
| git 网络  | 直连 `github.com:443` 不通；环境变量代理 `127.0.0.1:53584` 对 git 返回 `502 CONNECT tunnel failed` | 用 `-c http.proxy=http://127.0.0.1:7897 -c http.version=HTTP/1.1`（Clash Verge 端口），已验证可用 |
| 取令牌    | 不要打印明文                                                                                       | `printf 'url=https://github.com\n\n' \| git credential fill`，再从中提取 `password=` 行的值       |

### 5.4 红线（沿用）

- 不得 force push、不得 `git reset` 远端、不得删除或覆盖 `astro-blog`。
- 不得让用户「删库重传」：远端已有完整文件，增量提交即可。
- `.pages.yml`、`.github/workflows/deploy.yml`、`.gitignore` 必须留在仓库根目录。
- 不要把「本地测试通过」说成「线上验收通过」。

### 5.5 常用核对命令

```bash
cd /e/codex
git fetch origin -q && git status --short --branch && git log --oneline -3

# 最近构建（令牌取法见 5.3）
curl.exe -s "https://api.github.com/repos/hhhhhhhush/zhuang-ma-personal-site/actions/runs?per_page=1" \
  -H "Authorization: token $tok" -H "User-Agent: curl/8"

# 线上抽查
for p in "" about/ blog/ knowledge/ projects/ contact/ links/ rss.xml; do
  curl.exe -s -o /dev/null -w "/$p => %{http_code}\n" \
    "https://hhhhhhhush.github.io/zhuang-ma-personal-site/$p"
done
```

---

## 六、未跟踪文件

`docs/live-home.png`、`docs/live-projects.png` 是本机核对截图，**故意未提交**。
