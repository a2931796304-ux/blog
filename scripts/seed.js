const mysql = require('mysql2/promise');
require('dotenv').config();

const seed = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'personal_blog',
  });

  try {
    // 1. 创建示例用户（密码: 123456，bcrypt hash）
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('123456', 10);

    const [userResult] = await pool.query(
      'INSERT IGNORE INTO users (username, email, password) VALUES (?, ?, ?)',
      ['demo', 'demo@example.com', hashedPassword]
    );

    let userId = userResult.insertId;
    if (userId === 0) {
      // 用户已存在，查询 id
      const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', ['demo']);
      userId = rows[0].id;
    }

    // 2. 创建分类
    const categoryNames = ['技术', '生活', '读书笔记', 'AI'];
    for (const name of categoryNames) {
      await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [name]);
    }

    // 3. 创建示例文章
    const articles = [
      {
        title: '搭建个人博客网站的全流程指南',
        content: `## 前言

搭建一个属于自己的博客网站是每个技术人的梦想。本文将详细介绍如何使用 Node.js + Express + React 搭建一个功能完善的个人博客系统。

## 技术选型

- **后端**: Node.js + Express
- **前端**: React + TypeScript + Vite
- **数据库**: MySQL
- **认证**: JWT (JSON Web Token)

## 核心功能

### 1. 用户认证

使用 JWT 实现无状态的用户认证系统。注册时密码经过 bcrypt 加密存储，登录后返回 token 用于后续请求的身份验证。

### 2. 文章管理

支持文章的增删改查，包括：
- Markdown 格式的内容编写
- 文章分类管理
- 标签系统
- 封面图片
- 阅读量统计

### 3. 前端页面

采用 React + React Router 构建单页应用，包括首页文章列表、文章详情、用户登录注册等页面。

## 总结

通过这个项目，你可以学到全栈开发的核心技能，包括 RESTful API 设计、数据库操作、前端路由、状态管理等。`,
        category: '技术',
        tags: JSON.stringify(['Node.js', 'React', '博客', '全栈']),
        author_id: userId,
      },
      {
        title: '高效学习编程的五个建议',
        content: `## 引言

学习编程是一个漫长的过程，掌握正确的学习方法能让你事半功倍。

## 五个建议

### 1. 动手实践

看懂不等于会写。每学一个新概念，立刻动手写代码验证。编程是一门手艺，只有通过大量实践才能真正掌握。

### 2. 阅读优秀代码

GitHub 上有大量优秀的开源项目，阅读他人的代码能让你学到很多书本上学不到的技巧和设计思路。

### 3. 做项目驱动学习

不要陷入"教程地狱"。选择一个你感兴趣的项目，在做的过程中遇到问题再针对性学习，效率远高于按部就班看教程。

### 4. 善用搜索和 AI 工具

遇到问题先尝试自己搜索解决。现在有了 AI 编程助手，能极大提高学习和开发效率。但记住：理解比复制更重要。

### 5. 坚持与复盘

每天保持一定的编码时间，定期回顾自己写过的代码，思考如何改进。成长往往在不经意间发生。`,
        category: '技术',
        tags: JSON.stringify(['编程', '学习方法']),
        author_id: userId,
      },
      {
        title: '我的 2024 年度书单推荐',
        content: `## 前言

今年读了不少好书，在此分享几本对我影响最大的。

## 技术类

### 《深入理解计算机系统》

这本书被称为程序员的内功心法。从硬件层面到操作系统、编译器，全面讲解计算机系统的运作原理。虽然厚，但值得反复阅读。

### 《代码整洁之道》

Bob 大叔的经典之作。好的代码不仅要能运行，更要易于阅读和维护。这本书教会了我如何写出优雅的代码。

## 非技术类

### 《原子习惯》

微小的改变，日积月累会产生惊人的效果。这本书不仅适用于生活习惯的养成，对编程技能的提升同样适用。

### 《思考，快与慢》

诺贝尔经济学奖得主卡尼曼的著作，帮助我们理解人类思维的两种模式，以及常见的认知偏见。

## 总结

读书是性价比最高的自我投资。希望这份书单对你有所启发。`,
        category: '读书笔记',
        tags: JSON.stringify(['书单', '阅读', '成长']),
        author_id: userId,
      },
      {
        title: 'AI 大模型时代的前端开发新思路',
        content: `## 背景

2024 年 AI 大模型技术突飞猛进，各种 AI 编程工具层出不穷。前端开发也迎来了新的变革。

## AI 辅助开发

### Copilot & Cursor

GitHub Copilot 和 Cursor 等 AI 编程助手已经能完成大量重复性编码工作。作为开发者，我们需要从"写代码"转向"设计代码"。

### AI 生成 UI

利用 AI 根据描述生成页面布局和组件，大大提高了原型开发效率。

## 大模型 API 集成

前端可以直接调用 OpenAI 等大模型 API 实现智能功能：

- 智能搜索
- 内容摘要
- 代码生成
- 自然语言交互

## 新的技能要求

AI 时代的前端开发者需要：

1. 理解 AI 工具的能力边界
2. 掌握 prompt engineering
3. 关注用户体验和产品设计
4. 数据处理和分析能力

## 结语

AI 不是要取代开发者，而是让开发者变得更强大。拥抱变化，持续学习。`,
        category: 'AI',
        tags: JSON.stringify(['AI', '前端', '大模型']),
        author_id: userId,
      },
      {
        title: '记一次登山之旅',
        content: `上周末和朋友去爬了附近的一座山。

清晨六点出发，天刚蒙蒙亮。山路蜿蜒，两旁是郁郁葱葱的树木，空气里弥漫着泥土和青草的味道。

爬到半山腰时，大家都有些气喘吁吁，但远眺山下，城市的轮廓在晨雾中若隐若现，那一刻觉得所有的疲惫都值得了。

中午在山顶野餐，简单的三明治和水果，却感觉格外美味。

下山的时候腿已经有些发软，但心情格外舒畅。大自然总能给人充电。

## 一点感悟

写代码和爬山很像——过程中会有疲惫和挫败感，但只要坚持，登顶后的风景一定不会辜负你。`,
        category: '生活',
        tags: JSON.stringify(['生活', '户外', '登山']),
        author_id: userId,
      },
    ];

    for (const article of articles) {
      await pool.query(
        'INSERT IGNORE INTO articles (title, content, category, tags, author_id) VALUES (?, ?, ?, ?, ?)',
        [article.title, article.content, article.category, article.tags, article.author_id]
      );
    }

    console.log('✅ 种子数据插入成功！');
    console.log('   用户: demo / 123456');
    console.log(`   文章: ${articles.length} 篇`);
  } catch (error) {
    console.error('插入种子数据失败:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seed();