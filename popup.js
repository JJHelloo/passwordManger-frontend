document.getElementById('save').addEventListener('click', function() {
    // Retrieve the username and password and save them to your password manager
    chrome.storage.local.get(['username', 'password'], (result) => {
      const {username, password} = result;
      // Save the username and password to your password manager
      console.log(username, password);
    });
  });
  
  document.getElementById('cancel').addEventListener('click', function() {
    // Don't save the password
    console.log('User clicked "No"');
  });
  