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
                    setTimeout(() => {
                        nextPageButton.click();
                        scrapePageContent();
                    }, 3000);
                }
                else if (currentPageNumber >= 400) {
                    return 'done!';
                }
                else {
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapReview() {

    document.querySelector('.ReviewsList_reviewsList__yepAi');
    const reviewsList = document.querySelector('.ReviewsList_reviewsList__yepAi');
    const paginationElement = document.querySelector('.PaginationContainer_paginationCount__8BbqK');

    const textContent = paginationElement.textContent;
    let reviewPageCount = 5;
    // 使用正则表达式提取数字
    const match = textContent.match(/of\s([\d,]+)/);

    if (match && match[1]) {
        // 移除逗号，并将字符串转换为数字
        const totalReviews = parseInt(match[1].replace(/,/g, ''), 10);
        // 计算总页数
        const realPageCount = Math.ceil(totalReviews / 10);
        if (realPageCount < reviewPageCount) {
            reviewPageCount = realPageCount;
        }
    }
    for (let currentReviewIndex = 1; currentReviewIndex <= reviewPageCount; currentReviewIndex++) {
        const reviewDetailsElements = document.querySelectorAll('[data-test="review-details-container"]');


        reviewDetailsElements.forEach(async element => {
            const employerHeader = document.querySelector('p.employer-header_employerHeader__bcVFG.employer-header_header__bB4IL');
            const rating = element.querySelector('.review-details_overallRating__VDxCx');

            // 选中Pros和Cons两段评语
            const pros = element.querySelector('[data-test="review-text-pros"]');
            const cons = element.querySelector('[data-test="review-text-cons"]');

            // 选中职位名称
            const position = element.querySelector('.review-details_employee__5iA6v');

            // 选中雇佣细节
            const employmentDetails = element.querySelector('.review-details_employeeDetails__BvAwX');

            // 选中雇佣位置
            const location = element.querySelector('.review-details_location__E_Ine');


            const value = employerHeader ? employerHeader.textContent : 'Employer name not found';
            const value1 = rating ? rating.textContent.trim() : 'Rating not found';
            const value2 = pros ? pros.textContent.trim() : 'Pros not found';
            const value3 = cons ? cons.textContent.trim() : 'Cons not found';
            const value4 = position ? position.textContent.trim() : 'Position not found';
            const value5 = employmentDetails ? employmentDetails.textContent.trim() : 'Employment details not found';
            const value6 = location ? location.textContent.trim() : 'Location not found';

            const url = `http://localhost:5131/api/GlassDoor/PostReview?employerName=${value}&rating=${value1}&pros=${value2}&cons=${value3}&position=${value4}&employmentDetails=${value5}&location=${value6}`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': '*/*'
                },
                body: ''
            });


        });
        const nextPageButton = document.querySelector('button.pagination_ListItemButton__bBZi9.pagination_Chevron__GvAkD[data-test="next-page"]');

        if (nextPageButton) {
            // 点击按钮
            nextPageButton.click();
            console.log('Next page button clicked');
        }
        await delay(2000);  // 等待 2 秒
    }

    console.log("5秒前");
    await delay(5000);  // 等待 5 秒
    console.log("5秒后");
    chrome.runtime.sendMessage({ action: 'getCurrentUrl' }, (response) => {
        if (response.state === "FINISHED") {
            console.log("Finished scraping reviews.");
            return;
        }
        const reviewUrl = response.url;
        window.location.href = reviewUrl;
    });
}

chrome.storage.local.get(['scrapingReviewActive'], function (result) {
    const isActive = result.scrapingReviewActive;
    console.log('scrapingReviewActive status is:', isActive);
    if (isActive) {
        scrapReview();
    } else {
        scrapePageContent();
        console.log("Done!");
        chrome.storage.local.clear();
    }
});

