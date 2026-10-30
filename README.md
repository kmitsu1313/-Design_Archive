# Design_Archive

> 华东师范大学 2026学年第一学期 项目实践课
>
> 项目简介：【待补充，一句话说明做什么】

## 项目背景

本项目由两个方向的方案合并而来：

- **方案 A**（分支 `version-a`）：【负责人 / 特点】
- **方案 B**（分支 `version-b`）：【负责人 / 特点】

目标：从两个方案中各取所长，整合为一个统一版本（分支 `merge-ab`），审核通过后合入 `main`。

## 技术栈

- 前端框架：【待补充，如 Vue / React】
- 构建工具：【待补充，如 Vite】
- 包管理：npm

## 本地启动

```bash
git clone https://github.com/kmitsu1313/-Design_Archive.git
cd -Design_Archive
npm install
npm run dev
```

> 以上命令为通用默认，请按实际项目修改。

## 分支说明

| 分支 | 用途 |
| --- | --- |
| `main` | 稳定主分支，受保护，只能通过 PR 合入 |
| `version-a` | 方案 A 的完整代码，仅作保留与参考 |
| `version-b` | 方案 B 的完整代码，仅作保留与参考 |
| `merge-ab` | 合并两个方案的工作分支 |
| `feature/xxx` | 个人功能开发分支 |

## 协作流程

1. 开工前先同步：GitHub Desktop 点 **Fetch / Pull**
2. 新建自己的分支：`feature/简短描述`
3. 修改并提交（Commit），再推送（Push）
4. 在 GitHub 上发起 **Pull Request**，写清楚改了什么
5. 指定审核人，通过后合并
6. 合并后回到 `main` 重新 Pull，再开始下一个任务

## 提交信息规范

格式：`类型: 简短说明`

- `feat: 新增搜索功能`
- `fix: 修复列表滚动问题`
- `docs: 更新 README`
- `style: 调整按钮样式`

## 使用 AI 协作的约定

- 每次只让 AI 做一件小事，做完立刻提交
- 提交前先本地运行，确认页面正常
- 不要把密钥、`.env` 文件提交到仓库
- 不确定的大改动，先开 Issue 讨论
