// popup.js
//公司信息抓取控制器
document.getElementById('startScraping').addEventListener('click', () => {
    // 获取当前活动的标签页 ID
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTabId = tabs[0].id; // 获取当前活动标签页的 ID
        chrome.runtime.sendMessage({ action: 'startScraping', tabId: activeTabId });
    });
});


document.getElementById('pauseScraping').addEventListener('click', () => {
    // 通知背景脚本停止抓取任务
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTabId = tabs[0].id;
        chrome.runtime.sendMessage({ action: 'stopScraping', tabId: activeTabId });
    });
});

document.getElementById('clear').addEventListener('click', () => {
    chrome.storage.local.clear();
});

// 接收来自后台或内容脚本的消息
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateProgress') {
        if (message.progress === '总公司数') {
            document.getElementById('companyTotal').innerText = message.data;
        }
        if (message.progress === '公司抓取进度更新'){
            document.getElementById('companyProgress').innerText = message.data;
        }
        document.getElementById('output').value += `抓取进度: ${message.progress}\n`;
        document.getElementById('output').value += `抓取内容: ${message.data}\n`;
    }
});

//公司评论抓取控制器
document.getElementById('startScrapingReview').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTabId = tabs[0].id;
        chrome.runtime.sendMessage({ action: 'startScrapingReview', tabId: activeTabId });
    });
});

document.getElementById('pauseScrapingReview').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTabId = tabs[0].id;
        chrome.runtime.sendMessage({ action: 'stopScrapingReview', tabId: activeTabId });
    });
});