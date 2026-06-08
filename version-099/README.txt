部署说明

本 ZIP 已根据上传的 data_2000.txt 实际解析生成 2000 部影片：
- 首页：index.html
- 分类总览：categories.html
- 全部影片：category/all.html
- 排行榜：ranking.html
- 搜索筛选：search.html
- 详情页：movie/0001.html 至 movie/2000.html

图片引用说明：
页面已按要求引用顶级目录 1.jpg 到 150.jpg。上传素材中没有这些图片文件，部署前可将 1.jpg、2.jpg ... 150.jpg 放在网站根目录，与 index.html 同级。

播放器说明：
详情页使用上传 JS 中提取的 m3u8 播放源，并通过 assets/hls-dru42stk.js 初始化 HLS。建议通过 HTTP/HTTPS 服务器访问，不要直接用 file:// 打开，以确保 ES Module 和 HLS 加载正常。
