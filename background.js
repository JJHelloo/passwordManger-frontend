chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const {username, password} = request;

    // Save the username and password in case the user clicks 'Yes'
    chrome.storage.local.set({username, password});
});
