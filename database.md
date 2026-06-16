# 个人博客系统数据库设计

## 1. 设计目标

本数据库用于支持个人博客系统的基础功能，包括用户管理、文章发布、文章分类、标签记录、浏览次数统计等。

## 2. 数据表总览

| 表名 | 说明 |
| --- | --- |
| `users` | 用户表，存储博客作者或管理员账号信息 |
| `articles` | 文章表，存储博客文章内容和发布信息 |
| `categories` | 分类表，存储文章分类信息 |

## 3. 用户表：`users`

用于保存用户账号信息，文章作者通过 `articles.author_id` 关联到该表。

| 字段名 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | `INT` | 主键，自增 | 用户 ID |
| `username` | `VARCHAR(50)` | 非空，唯一 | 用户名 |
| `email` | `VARCHAR(100)` | 非空，唯一 | 邮箱 |
| `password` | `VARCHAR(255)` | 非空 | 密码，加密后存储 |
| `avatar` | `VARCHAR(255)` | 可为空 | 用户头像 URL |
| `created_at` | `DATETIME` | 默认当前时间 | 创建时间 |

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 4. 文章表：`articles`

用于保存博客文章信息，文章内容建议使用 Markdown 格式存储。

| 字段名 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | `INT` | 主键，自增 | 文章 ID |
| `title` | `VARCHAR(200)` | 非空 | 文章标题 |
| `content` | `TEXT` | 非空 | 文章内容，Markdown 格式 |
| `cover` | `VARCHAR(255)` | 可为空 | 封面图 URL |
| `category` | `VARCHAR(50)` | 可为空 | 文章分类名称 |
| `tags` | `JSON` | 可为空 | 标签，JSON 数组格式 |
| `author_id` | `INT` | 非空，外键 | 作者 ID，关联 `users.id` |
| `views` | `INT` | 默认 `0` | 浏览次数 |
| `created_at` | `DATETIME` | 默认当前时间 | 创建时间 |
| `updated_at` | `DATETIME` | 自动更新时间 | 更新时间 |

```sql
CREATE TABLE articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  cover VARCHAR(255),
  category VARCHAR(50),
  tags JSON,
  author_id INT NOT NULL,
  views INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_author
    FOREIGN KEY (author_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
```

## 5. 分类表：`categories`

用于保存博客文章分类信息，方便后续对文章进行分类展示和筛选。

| 字段名 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | `INT` | 主键，自增 | 分类 ID |
| `name` | `VARCHAR(50)` | 非空，唯一 | 分类名称 |
| `description` | `VARCHAR(255)` | 可为空 | 分类描述 |

```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
);
```

## 6. 表关系说明

- 一个用户可以发布多篇文章。
- 一篇文章只能属于一个作者。
- `articles.author_id` 是外键，关联 `users.id`。
- `articles.category` 暂时使用分类名称存储，后续也可以改为 `category_id` 外键关联 `categories.id`。
- `articles.tags` 使用 JSON 数组存储，例如：`["前端", "Vue", "学习笔记"]`。
