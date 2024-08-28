// background.js
console.log("Background script running");
let scrapingActive = false;

// 处理来自 popup.js 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startScraping') {
        scrapingActive = true;
        chrome.storage.local.set({ 'scrapingActive': true });  // 存储状态
        startScraping(message.tabId);
    } else if (message.action === 'stopScraping') {
        scrapingActive = false;
        chrome.storage.local.set({ 'scrapingActive': false });  // 存储状态
    }

    if (message.action === 'logCompanyData') {
        // console.log('公司名称:', message.companyName);
        // console.log('公司Logo:', message.companyLogo);
        // console.log('公司评分:', message.companyRating);
        // console.log('公司地址:', message.companyLocation);
        // console.log('公司规模:', message.companySize);
        // console.log('公司行业:', message.companyIndustry);
        // console.log('公司描述:', message.companyDescription);
        console.log('公司Review URL:', message.companyReviewUrl);
        // console.log('公司Salary URL:', message.companySalaryUrl);
    }
    if (message.action === 'getScrapingStatus') {
        sendResponse({ scrapingActive: scrapingActive });
    }
});


// 开始爬取数据
function startScraping(tabId) {
    if (scrapingActive) {
        // 注入并执行 content.js 在指定的标签页中
        chrome.scripting.executeScript({
            target: { tabId: tabId }, // 目标标签页 ID
            files: ['content.js'] // 需要注入的脚本文件
        }, () => {
            console.log("Content script injected and running in tab:", tabId);
        });
    }
}
