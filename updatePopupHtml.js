const fs = require('fs');
const path = require('path');

// Directory where the build output is located
const buildDir = path.join(__dirname, 'build', 'static', 'js');

// Find the main.js file in the build output
const mainFile = fs.readdirSync(buildDir).find(file => file.startsWith('main.'));

// Path to popup.html
const popupHtmlPath = path.join(__dirname, 'popup.html');

// Read popup.html
let popupHtml = fs.readFileSync(popupHtmlPath, 'utf-8');

// Replace build.js with the actual filename
popupHtml = popupHtml.replace('build.js', `static/js/${mainFile}`);

// Write the updated HTML back to popup.html
fs.writeFileSync(popupHtmlPath, popupHtml);
