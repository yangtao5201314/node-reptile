const axios = require('axios');
const cheerio = require('cheerio');
const XlsxPopulate = require('xlsx-populate');

async function scrapeJuejinPosts(userId, totalPages) {
    const posts = [];
    const url_1 = `https://blog.csdn.net/${userId}?type=blog`;
    const response_1 = await axios.get(url_1);
    const html = response_1.data;
    const $ = cheerio.load(html);
    const user_name = $('.user-profile-head-name').children().eq(0).text();
    //loop through the totalPages
    for (let page = 1; page <= totalPages; page++) {
        //create the url for the current page
        const url = `https://blog.csdn.net/community/home-api/v1/get-business-list?page=${page}&size=20&businessType=blog&orderby=&noMore=false&year=&month=&username=${userId}`;
        try {
            //make an axios request to the current page
            const response = await axios.get(url)
            console.log(response.data, 333333)
            let success = response.data;
            if (success.code === 200){
                let dataArr = success.data.list
                dataArr.forEach(res=>{
                    posts.push(res);
                })
            }

            console.log(`第 ${page} 页爬取完成`);
        } catch (error) {
            console.error(`第 ${page} 页爬取失败: ${error.message}`);
        }
    }
    //save the posts to an excel file
    saveToExcel(posts,user_name);
}

// 使用示例
scrapeJuejinPosts("qq_48652579", 20); // 爬取用户ID为 3307789418773736 的文章，共爬取 5 页


async function saveToExcel(data, userName) {
    const workbook = await XlsxPopulate.fromBlankAsync();

    const sheet = workbook.sheet(0);
    sheet.cell('A1').value('文章标题');
    sheet.cell('B1').value('文章链接');
    sheet.cell('C1').value('封面');

    data.forEach((item, index) => {
        const rowIndex = index + 2;
        sheet.cell(`A${rowIndex}`).value(item.title);
        sheet.cell(`B${rowIndex}`).value(item.url);
        sheet.cell(`C${rowIndex}`).value(item.picList[0]);
    });

    await workbook.toFileAsync(`${userName}.xlsx`);
    console.log('数据已保存到Excel文件');
}