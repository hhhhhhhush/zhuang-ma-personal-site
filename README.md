# Zhuang Ma — Personal Space

**中文完整教程与交付说明：[README.zh-CN.md](README.zh-CN.md)。测试和授权边界：[docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)。**

An editorial, bilingual-ready personal website built with Astro, TypeScript, Markdown Content Collections and Pages CMS. Content is stored as portable Markdown and JSON files in Git; the public site is a static build.

> **Before publishing:** biography details, email, GitHub and social accounts are intentionally blank/placeholders. Project cards and writing samples are explicitly examples, not claims about the site owner's experience or completed work. Replace or remove them before sharing the live site.

## Run locally

Requirements: Node.js 22.12+ (CI uses Node 24), npm.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4321`. Run `npm test`, `npm run check`, `npm run build`, and `npm run test:site` for the unit, type/content, build, and generated-site checks.

## Content model

- `data/profile.json`: editable profile and experience timeline.
- `data/site-config.json`, `data/navigation.json`, `data/social-links.json`, `data/resources.json`: site settings, navigation, public links and bookmarks.
- `src/content/blog/*.md`: public writing. Frontmatter uses `status: draft | published | unlisted`; only `published` entries with dates no later than today are built or included in RSS.
- `src/content/knowledge/*.md`: independent garden notes, with `maturity: Seedling | Growing | Evergreen`.
- `src/content/projects/*.md`: project details, screenshots, stack, URLs and status.
- `public/images/`: uploaded media, organized by Pages CMS field path.
- `src/content.config.ts`: validated Astro collection schemas. Invalid content fails the build instead of silently publishing.

All CMS-produced URLs are validated as HTTP(S) or root-relative media paths where appropriate. Do not put private notes, credentials, tokens or conversations in this public Git repository — even in a draft. A draft is not private storage.

## Publish with Pages CMS

1. Create a GitHub repository and push this project (including `package-lock.json`) to `main`.
2. Open [Pages CMS](https://pagescms.org/) and sign in with the GitHub account that owns or has authorized access to the repository. Select this repository. Its root `.pages.yml` configures the editor and `public/images` upload storage.
3. Edit **个人资料** to set only accurate information. Social accounts are managed in **社交链接**. Replace the example posts and projects, or delete them.
4. In **博客文章** or **知识笔记**, create an entry. Set `status` to `draft` while editing; choose `published` only after review. In **项目作品**, publish the entry and set its project status separately. Add an image with the media picker to upload it to this repository.
5. Save through Pages CMS. It commits to the selected Git branch. A push to `main` triggers the Actions workflow. Check the GitHub **Actions** tab; the build/type/content tests must pass before the Pages artifact can be deployed.

The CMS is Pages CMS's real GitHub-authenticated editor, not a locally hosted login. GitHub account authorization, repository ownership/selection, and verifying that the GitHub App can write to the selected repository require the site owner's action. No GitHub token is stored or shipped by this website. Public front-end requests do not expose a write credential.

## GitHub Pages deployment

`.github/workflows/deploy.yml` builds the site and deploys it via GitHub's Pages artifact action, with `contents: read`, `pages: write` and `id-token: write` limited to the build/deploy job. Failed checks or builds cannot reach the deploy step. Set repository **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. Ensure Actions are enabled.

The build determines its URL and path automatically from repository owner/name. For `username.github.io`, the path is `/`; for a project repository it is `/<repository>/`. For a custom domain, set the DNS and `public/CNAME`, and set GitHub repository Actions variables `SITE_URL` to the real origin and `BASE_PATH` to `/`. Do not add a fake CNAME. The local default uses `https://example.com` and `robots.txt` disallows crawling until a real site URL is configured.

## CMS functionality and boundaries

The checked-in `.pages.yml` defines editable profile/timeline, social links, navigation, site settings, articles, knowledge, projects, resource bookmarks and categorized image uploads. Markdown rich-text editors can insert images. Pages CMS commits content to GitHub; the Actions push trigger rebuilds the site. Login and write/delete/upload round-trips cannot be exercised without an authorized GitHub account and a configured repository. Thus they are configured, not represented as remotely acceptance-tested.

GitHub Pages and this client CMS cannot offer private unpublished content to the public repository safely. Keep private knowledge and AI conversations in a separate private system; move material to this public repository only after explicit human review and approval. There is deliberately no automatic private-to-public synchronization or public contact form.

## Accessibility, search and SEO

Search runs locally over published titles, summaries and tags; category/tag filters combine, state is shareable in the query string, and results are paginated. SEO metadata and canonical links are per page; sitemap, `robots.txt`, RSS and 404 are generated. The site includes a keyboard-operated mobile menu, theme toggle, visible focus, skip link, reduced-motion handling, semantic headings and article outline/progress. PNG share artwork and its editable SVG source are included (`npm run generate:social`). Fonts are self-hosted, loaded with `font-display: swap`, and backed by Chinese/English system fallbacks. No external analytics, form endpoint, font service, image CDN, or tracking is required. GitHub Pages controls response cache headers; bundled CSS/JS/font assets have hashed names. Upload compressed WebP/AVIF images with sensible dimensions rather than unmodified multi-megabyte originals.

## Owner setup checklist

- [ ] Replace `待填写中文姓名`, biography, skills, interests and learning topics with accurate details.
- [ ] Upload and set an avatar; set a public email/GitHub/social links only if desired.
- [ ] Replace or delete **all** sample blog, knowledge and project entries before public launch.
- [ ] Create the repository, push `main`, authorize Pages CMS, and confirm the first save/Actions run.
- [ ] In GitHub repository settings, enable Pages with GitHub Actions as the source.
- [ ] Configure a custom domain only after selecting its actual hostname and DNS.
- [ ] Check the live website, RSS, sitemap, search, mobile navigation, dark mode and uploaded image URLs.

## Future extension

Collections have separate public/private lifecycle concepts only for public publication (`draft`, `published`, `unlisted`); all checked-in content remains public/repository-readable. A future AI knowledge integration must use a separate private store and explicit human export/review step. No AI ingestion, account system, member feature, comments or private backend is included in this first version.
