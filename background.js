
var badgeInfo = {};
Promise.all([
    countWindows(),
    countCurrentWindowTabs(),
])
.then(result => {
    badgeInfo.windowCount = result[0];
    badgeInfo.tabCount = result[1];
    updateBadge();
});
respondWindowEvent('onCreated');
respondWindowEvent('onRemoved');
respondWindowEvent('onFocusChanged');
respondTabEvent('onCreated');
respondTabEvent('onRemoved');


function respondWindowEvent(onEvent) {
    browser.windows[onEvent].addListener(async () => {
        if (onEvent === 'onFocusChanged') {
            badgeInfo.tabCount = await countCurrentWindowTabs();
        } else {
            badgeInfo.windowCount = await countWindows();
        }
        updateBadge();
    });
}

function respondTabEvent(onEvent) {
    browser.tabs[onEvent].addListener(async (tabId) => {
        badgeInfo.tabCount = await countCurrentWindowTabs(tabId, onEvent === 'onRemoved');
        updateBadge();
    });
}

async function countWindows() {
    const windows = await browser.windows.getAll();
    return windows.length;
}

async function countCurrentWindowTabs(tabId, isOnRemoved) {
    const tabs = await browser.tabs.query({ currentWindow: true });
    let count = tabs.length;
    // onRemoved fires too early and the count is one too many. https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
    if (isOnRemoved && tabId && tabs.map(t => t.id).includes(tabId)) count--;
    return count;
}

function updateBadge() {
    browser.browserAction.setBadgeText({ text: `${badgeInfo.windowCount}-${badgeInfo.tabCount}` });
}


