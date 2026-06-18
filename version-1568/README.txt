纯静态电影网站生成说明

已生成页面：
- 首页：index.html
- 分类总览：categories.html
- 独立分类页：category/*.html
- 排行榜：ranking.html
- 搜索筛选：search.html
- 影片详情页：video/*.html
- 影片数量：2000

图片说明：
页面按要求引用网站顶级目录下的 1.jpg 到 150.jpg 作为封面、Hero 与卡片图片。
如果你要替换封面图，请把 1.jpg、2.jpg ... 150.jpg 放在网站根目录，文件名保持一致。

播放说明：
详情页使用 m3u8 播放源，并通过 hls.js 初始化 HLS 播放；支持浏览器原生 HLS 的环境也会直接播放。

部署方式：
把本 ZIP 解压后的全部文件上传到网站根目录即可访问。
