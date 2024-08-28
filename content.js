// content.js

// Function to scrape the content of the page
async function scrapePageContent() {

    const resultCountSpan = document.querySelector('.resultCount.css-56kyx5');
    const strongElements = resultCountSpan.querySelectorAll('strong');
    const thirdStrong = strongElements[2];
    const thirdStrongContent = thirdStrong.innerText;
    const cleanedStr = thirdStrongContent.replace(/,/g, "");
    const totalCompanyNumber = parseInt(cleanedStr, 10);
    const totalPageCount = Math.ceil(totalCompanyNumber / 10);

    chrome.storage.local.get(['currentPageNumber', 'currentCompanyCount', 'scrapingActive'], (result) => {
        let scrapingActive = result.scrapingActive !== false;  // 默认认为 scrapingActive 为 true
        let currentPageNumber = result.currentPageNumber || 1;  // 默认从第一页开始
        let currentCompanyCount = result.currentCompanyCount || 0;  // 默认从0开始


        continueScraping(currentPageNumber, currentCompanyCount, scrapingActive);
        const nextPageButton = document.querySelector('[data-test="pagination-next"]');
        checkScrapingStatus((scrapingActive) => {
            if (scrapingActive) {
                const isDisabled = nextPageButton.disabled || nextPageButton.classList.contains('disabled');
                if (!isDisabled) {
                    nextPageButton.click();
                    setTimeout(() => {
                        scrapePageContent();
                    }, 3000);
                }
                else if(currentPageNumber >=400){
                    return 'done!';
                }
                else{
                    return 'done!';
                }
            }
        });
    });

    function continueScraping(currentPageNumber, currentCompanyCount, scrapingActive) {
        if (!scrapingActive) {
            console.log("Scraping stopped.");
            return;
        }

        sendProgressUpdate("总公司数", thirdStrongContent);
        sendProgressUpdate("总页面数量", totalPageCount.toString());

        const employerCardElements = document.querySelectorAll('[data-test="employer-card-single"]');
        for (let employerCard of employerCardElements) {
            if (!scrapingActive) {
                console.log("Scraping stopped.");
                return;
            }

            const companyNameElement = employerCard.querySelector('[data-test="employer-short-name"]');
            const companyName = companyNameElement ? companyNameElement.innerText : '公司名称为空';

            const companyLogoElement = employerCard.querySelector('[data-test="employer-logo"]');
            const companyLogo = companyLogoElement ? companyLogoElement.src : '公司logo为空';

            const companyRatingElement = employerCard.querySelector('[data-test="rating"]');
            const companyOverAllRating = companyRatingElement ? (companyRatingElement.querySelector('b') ? companyRatingElement.querySelector('b').innerText : '公司评分为空') : '公司评分为空';

            const companyLocationElement = employerCard.querySelector('[data-test="employer-location"]');
            const companyLocation = companyLocationElement ? (companyLocationElement.querySelector('a') ? companyLocationElement.querySelector('a').innerText : '公司地址为空') : '公司地址为空';

            const companySizeElement = employerCard.querySelector('[data-test="employer-size"]');
            const companySize = companySizeElement ? companySizeElement.innerText : '公司规模为空';

            const companyIndustryElement = employerCard.querySelector('[data-test="employer-industry"]');
            const companyIndustry = companyIndustryElement ? companyIndustryElement.innerText : '公司行业为空';

            const companyDescriptionElement = employerCard.querySelector('p.css-1sj9xzx.css-56kyx5');
            const companyDescription = companyDescriptionElement ? companyDescriptionElement.innerText : '公司描述为空';

            const companyReviewUrlElement = employerCard.querySelector('[data-test="cell-Reviews-url"]');
            const companyReviewUrl = companyReviewUrlElement ? companyReviewUrlElement.href : '公司Review URL为空';

            const companySalaryUrlElement = employerCard.querySelector('[data-test="cell-Salaries-url"]');
            const companySalaryUrl = companySalaryUrlElement ? companySalaryUrlElement.href : '公司Salary URL为空';

            chrome.runtime.sendMessage({
                action: 'logCompanyData',
                companyName: companyName,
                companyLogo: companyLogo,
                companyRating: companyOverAllRating,
                companyLocation: companyLocation,
                companySize: companySize,
                companyIndustry: companyIndustry,
                companyDescription: companyDescription,
                companyReviewUrl: companyReviewUrl,
                companySalaryUrl: companySalaryUrl
            });

            currentCompanyCount++;
            sendProgressUpdate("公司抓取进度更新", currentCompanyCount.toString());
        }
        currentPageNumber++;
        sendProgressUpdate("当前页面数", currentPageNumber.toString());
        sendProgressUpdate("当前公司数", currentCompanyCount.toString());

        chrome.storage.local.set({
            'currentPageNumber': currentPageNumber,
            'currentCompanyCount': currentCompanyCount
        }, () => {
            console.log('Progress has been stored.');
        });

    }

    function checkScrapingStatus(callback) {
        chrome.runtime.sendMessage({ action: 'getScrapingStatus' }, (response) => {
            if (response && response.scrapingActive !== undefined) {
                callback(response.scrapingActive);
            } else {
                console.error('Failed to get scraping status');
            }
        });
    }
}


//与前面板通信
function sendProgressUpdate(progress, data) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            action: 'updateProgress',
            progress: progress,
            data: data
        }, () => {
            resolve();
        });
    });
}


scrapePageContent();
console.log("Done!");
chrome.storage.local.clear();
