# Design Archive · 设计文献研究中心

华东师范大学 2026 学年第一学期项目实践课。我们把球形馆藏和文献资料库整合成一个可交互的设计档案网站。读者可以从一本书的封面进入分类，再转到资料库查阅文献。

[打开网站 · 在线预览](https://kmitsu1313.github.io/-Design_Archive/)

## 后续协作分工

接下来，我们分四项推进：

1. **《问道》排版与上线**。我们安排两位同学完成《问道》的排版，排好后交给陆毅，由陆毅把内容放到网页里。
2. **手机端制作**。我们安排三位同学负责手机端。相关文件已发在项目群里，后续也会上传到这个 GitHub 仓库。
3. **网页修改**。陆毅和张帅航一起修改现有网页。
4. **展览交互装置**。何逸凡负责研究球形交互装置，供展览使用。

## 我们怎么用 GitHub 协作

`main` 是线上网站使用的主分支。我们每做一项任务，就开一个分支，让 Agent 在里面改。预览满意后，再把改动合回 `main`。

**第一次加入。** 安装 [GitHub Desktop](https://desktop.github.com/) 并登录自己的 GitHub 账号。打开[项目仓库](https://github.com/kmitsu1313/-Design_Archive)，点 **Code → Open with GitHub Desktop → Clone**。记住保存位置，之后用 Agent 打开这个文件夹。如果还没有写入权限，请仓库负责人把你的 GitHub 账号加为协作者。

### 1. 创建自己的分支，或接着同学的分支做

- **开始新任务**：在 Desktop 顶部点 **Current Branch → main**，再点 **Fetch origin** 检查更新。如果出现 **Pull origin**，点它把最新版拉到电脑。接着点 **Current Branch → New Branch**，起一个容易辨认的名字，例如 `mobile-layout`，从 `main` 创建。点 **Publish branch**，其他同学就能找到它。
- **接手已有任务**：请同学先推送改动，把分支名发给你。点 **Fetch origin**，在 **Current Branch** 中搜索并选中那个分支；如果出现 **Pull origin**，再点一下。顶部显示同学发来的分支名，就可以让 Agent 接着做了。

### 2. 让 Agent 修改，自己看效果

用 Agent 打开刚才克隆的文件夹，告诉它要改哪个页面，以及你希望看到什么。比如做手机端时，可以直接发：

> 请确认当前分支是 mobile-layout。帮我调整资料库首页，让搜索框在手机竖屏时完整显示。改好后请启动本地预览，把地址和检查方法发给我。

确认效果后，回到 Desktop，在左下角 **Summary** 用一句中文写明改动，例如“调整手机端搜索框宽度”。点 **Commit to 当前分支名** 把改动保存在本机，再点 **Push origin** 上传到 GitHub。

### 3. 合并到主分支，让大家看到新版

1. 打开仓库的 **Pull requests → New pull request**。把 **base** 选为 `main`，**compare** 选为自己的分支，点 **Create pull request**。标题写清改了什么，页面调整可以附一张预览截图。
2. 请一位同学看过改动，由有权限的成员点 **Merge pull request → Confirm merge**。GitHub Pages 发布完成后，打开上方的在线预览就能看到新版。
3. 下次开工前，在 Desktop 切回 `main`，点 **Fetch origin**，有更新就点 **Pull origin**，再为下一项任务创建分支。
