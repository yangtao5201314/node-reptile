const axios = require('axios');
const cheerio = require('cheerio');
const XlsxPopulate = require('xlsx-populate');

async function scrapeJuejinPosts(userId, totalPages) {
    const posts = [];
    const url_1 = `https://juejin.cn/user/${userId}/posts`;
    const response_1 = await axios.get(url_1);
    const html = response_1.data;
    const $ = cheerio.load(html);
    const user_name = $('.user-name').text();

    for (let page = 1; page <= totalPages; page++) {
        const url = `https://juejin.cn/user/${userId}/posts?page=${page}`;
        try {
            const response = await axios.get(url);
            const html = response.data;
            const $ = cheerio.load(html);

            // 在这里使用cheerio选择器提取所需的数据
            // 例如：$('.post-item').each((index, element) => { ... });

            $('.entry-list > .item').each(function () {
                const title = $(this).find('.title').text();
                const summary = $(this).find('.abstract').text();
                const link = $(this).find('.title').attr('href');

                posts.push({
                    title,
                    summary,
                    link,
                });
            });
            // 处理或保存所提取的数据
            console.log(`第 ${page} 页爬取完成`);
        } catch (error) {
            console.error(`第 ${page} 页爬取失败: ${error.message}`);
        }
    }
    saveToExcel(posts, user_name);
}

// 使用示例
scrapeJuejinPosts(3382566225183191, 20); // 爬取用户ID为 3307789418773736 的文章，共爬取 5 页


async function saveToExcel(data, userName) {
    const workbook = await XlsxPopulate.fromBlankAsync();

    const sheet = workbook.sheet(0);
    sheet.cell('A1').value('标题');
    sheet.cell('B1').value('链接');
    sheet.cell('C1').value('总结');

    data.forEach((item, index) => {
        const rowIndex = index + 2;
        sheet.cell(`A${rowIndex}`).value(item.title);
        sheet.cell(`B${rowIndex}`).value(item.link);
        sheet.cell(`C${rowIndex}`).value(item.summary);
    });

    await workbook.toFileAsync(`${userName}.xlsx`);
    console.log('数据已保存到Excel文件');
}