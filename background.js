// background.js
console.log("Background script running");
let scrapingActive = false;
let scrapingReviewActive = false;
let currentReviewIndex = 0;
let reviewUrls = [];

// 处理来自 popup.js 的消息
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'startScraping') {
        scrapingActive = true;
        chrome.storage.local.set({ 'scrapingActive': true });  // 存储状态
        startScraping(message.tabId);
    } else if (message.action === 'stopScraping') {
        scrapingActive = false;
        chrome.storage.local.set({ 'scrapingActive': false });  // 存储状态
    }

    if (message.action === 'logCompanyData') {

        // const url = `http://localhost:5131/api/GlassDoor/UploadGlassDoorCompany` + 
        // `?companyName=${message.companyName}&companyLogo=${message.companyLogo}` + 
        // `&companyRating=${message.companyRating}&companyLocation=${message.companyLocation}` + 
        // `&companySize=${message.companySize}&companyIndustry=${message.companyIndustry}` + 
        // `&companyDescription=${message.companyDescription}&companyReviewUrl=${message.companyReviewUrl}` + 
        // `&companySalaryUrl=${message.companySalaryUrl}`;;

        // const response = await fetch(url, {
        //     method: 'POST',
        //     headers: {
        //         'Accept': '*/*'
        //     },
        //     body: ''  
        // });

        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }
    }
    if (message.action === 'getScrapingStatus') {
        sendResponse({ scrapingActive: scrapingActive });
    }
    if(message.action === 'startScrapingReview'){
        scrapingReviewActive = true;
        startScrapingReview(message.tabId);
        chrome.storage.local.set({ 'scrapingReviewActive': true });
    }
    else if (message.action === 'stopScrapingReview') {
        scrapingReviewActive = false;
        chrome.storage.local.set({ 'scrapingReviewActive': false });
    }
    if(message.action === 'getCurrentUrl'){
        if(currentReviewIndex >= reviewUrls.length){
            sendResponse({state:"FINISHED"});
            return;
        }
        else{
            sendResponse({url: reviewUrls[currentReviewIndex]});
            currentReviewIndex++;
        }

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

async function startScrapingReview(tabId){
    const response = await fetch('http://localhost:5131/api/GlassDoor/GetReviewUrls', {
        method: 'GET',
        headers: {
            'Accept': '*/*',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    reviewUrls = data.result.data;
    

    if(scrapingReviewActive){
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }, () => {
            console.log("Content script injected and running in tab:", tabId);
        });
    }
}
