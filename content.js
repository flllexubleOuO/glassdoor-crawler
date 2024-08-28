// content.js

// Function to scrape the content of the page
async function scrapePageContent() {
    const pageUrl = window.location.href;
    chrome.runtime.sendMessage({ action: "logUrl", url: pageUrl });

    const resultCountSpan = document.querySelector('.resultCount.css-56kyx5');
    //获取总公司数量
    const strongElements = resultCountSpan.querySelectorAll('strong');
    const thirdStrong = strongElements[2];
    const thirdStrongContent = thirdStrong.innerText;
    const cleanedStr = thirdStrongContent.replace(/,/g, "");
    const totalCompanyNumber = parseInt(cleanedStr, 10);
    let currentCompanyCount = 0;
    const totalPageCount = Math.ceil(totalCompanyNumber / 10);
    let cueentPageNumber = 1;
    //更新前面板进度
    await sendProgressUpdate("总公司数", thirdStrongContent);
    await sendProgressUpdate("总页面数量", totalPageCount.toString());

    for (cueentPageNumber; cueentPageNumber <= totalPageCount; cueentPageNumber++) {
        const employerCardElements = document.querySelectorAll('[data-test="employer-card-single"]');
        for (let employerCard of employerCardElements) {
            //公司名称
            // 公司名称
            const companyNameElement = employerCard.querySelector('[data-test="employer-short-name"]');
            if (companyNameElement) {
                const companyName = companyNameElement.innerText;
                await sendProgressUpdate("获取公司名称", companyName);
                console.log(companyName);
            }
            else {
                await sendProgressUpdate("获取公司名称", "公司名称为空");
                console.log("公司名称为空");
            }

            // 公司logo
            const companyLogoElement = employerCard.querySelector('[data-test="employer-logo"]');
            if (companyLogoElement) {
                const companyLogo = companyLogoElement.src;
                await sendProgressUpdate("获取公司logo", companyLogo);
                console.log(companyLogo);
            }
            else {
                await sendProgressUpdate("获取公司logo", "公司logo为空");
                console.log("公司logo为空");
            }

            // 公司评分
            const companyRatingElement = employerCard.querySelector('[data-test="rating"]');
            if (companyRatingElement) {
                const ratingSpan = companyRatingElement.querySelector('b');
                if (ratingSpan) {
                    const companyOverAllRating = ratingSpan.innerText;
                    await sendProgressUpdate("获取公司评分", companyOverAllRating);
                    console.log(companyOverAllRating);
                }
            }
            else {
                await sendProgressUpdate("获取公司评分", "公司评分为空");
                console.log("公司评分为空");
            }

            // 公司地址
            const companyLocationElement = employerCard.querySelector('[data-test="employer-location"]');
            if (companyLocationElement) {
                const locationChild = companyLocationElement.querySelector('a');
                if (locationChild) {
                    const companyLocation = locationChild.innerText;
                    await sendProgressUpdate("获取公司地址", companyLocation);
                    console.log(companyLocation);
                }
            }
            else {
                await sendProgressUpdate("获取公司地址", "公司地址为空");
                console.log("公司地址为空");
            }

            // 公司规模
            const companySizeElement = employerCard.querySelector('[data-test="employer-size"]');
            if (companySizeElement) {
                const companySize = companySizeElement.innerText;
                await sendProgressUpdate("获取公司规模", companySize);
                console.log(companySize);
            }
            else {
                await sendProgressUpdate("获取公司规模", "公司规模为空");
                console.log("公司规模为空");
            }

            // 公司行业
            const companyIndustryElement = employerCard.querySelector('[data-test="employer-industry"]');
            if (companyIndustryElement) {
                const companyIndustry = companyIndustryElement.innerText;
                await sendProgressUpdate("获取公司行业", companyIndustry);
                console.log(companyIndustry);
            }
            else {
                await sendProgressUpdate("获取公司行业", "公司行业为空");
                console.log("公司行业为空");
            }

            // 公司描述
            const companyDescriptionElement = employerCard.querySelector('p.css-1sj9xzx.css-56kyx5');
            if (companyDescriptionElement) {
                const companyDescription = companyDescriptionElement.innerText;
                await sendProgressUpdate("获取公司描述", companyDescription);
                console.log(companyDescription);
            }
            else {
                await sendProgressUpdate("获取公司描述", "公司描述为空");
                console.log("公司描述为空");
            }

            //glassdoor review url
            const companyReviewUrlElement = employerCard.querySelector('[data-test="cell-Reviews-url"]');
            const companyReviewUrl = companyReviewUrlElement.href;
            await sendProgressUpdate("获取公司review url", companyReviewUrl);
            console.log(companyReviewUrl);

            //glassdoor salary url
            const companySalaryUrlElement = employerCard.querySelector('[data-test="cell-Salaries-url"]');
            const companySalaryUrl = companySalaryUrlElement.href;
            await sendProgressUpdate("获取公司salary url", companySalaryUrl);
            console.log(companySalaryUrl);


            //更新当前公司数
            currentCompanyCount++;
            await sendProgressUpdate("公司抓取进度更新", currentCompanyCount.toString());
        }
    }

    return 'task completed\n';
}

function sendProgressUpdate(progress, data) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            action: 'updateProgress',
            progress: progress,
            data: data
        }, () => {
            resolve(); // 确保消息处理完成后继续
        });
    });
}

// Listen for messages from popup.js or background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrape") {
        // Scrape the content and send it back to the popup
        const content = scrapePageContent();
        sendResponse({ data: content });
    }
});
