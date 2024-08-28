// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("URL received and logged:", request.url);
    if (request.action === "logUrl") {
        chrome.storage.local.get({ urls: [] }, (result) => {
            const updatedUrls = result.urls;
            updatedUrls.push(request.url);
            chrome.storage.local.set({ urls: updatedUrls });
        });
    }
});
