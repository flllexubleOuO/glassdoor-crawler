// popup.js

document.getElementById('startScraping').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
        }, () => {
            // 注入成功后发送消息
            chrome.tabs.sendMessage(tabs[0].id, { action: "scrape" }, (response) => {
                console.log("Response from content script:", response); 
                document.getElementById('output').value = "开始抓取内容...\n";
                if (response && response.data) {
                    document.getElementById('output').value += response.data;
                } else {
                    document.getElementById('output').value = '无法抓取内容\n';
                }
            });
        });
    });
});
//暂停抓取
document.getElementById('pauseScraping').addEventListener('click', () => {
    document.getElementById('output').value += "\nScraping paused.";
});


// 接收来自后台或内容脚本的消息
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateProgress') {
        if (message.progress === '总公司数') {
            document.getElementById('companyTotal').innerText = message.data;
        }
        if (message.progress === '总页面数量') {
            document.getElementById('pageTotal').innerText = message.data;
        }
        if (message.progress === '公司抓取进度更新'){
            document.getElementById('companyProgress').innerText = message.data;
        }
        document.getElementById('output').value += `抓取进度: ${message.progress}\n`;
        document.getElementById('output').value += `抓取内容: ${message.data}\n`;
    }
});
