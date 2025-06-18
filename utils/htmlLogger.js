// utils/htmlLogger.js
let logs = [];
const htmlPath = require('path').join(__dirname, '../reports/report.html');

function logHtml(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const formatted = `<p class="${type}"><strong>[${timestamp}]</strong> ${message}</p>`;
  logs.push(formatted);
}

function saveHtmlReport() {
  const fullHtml = `
    <html>
    <head>
      <style>
        body { font-family: sans-serif; padding: 1em; background: #f9f9f9; }
        p.success { color: green; }
        p.error { color: red; }
        p.info { color: #333; }
      </style>
    </head>
    <body>
      <h2>Automation Report</h2>
      ${logs.join('\n')}
    </body>
    </html>
  `;
  require('fs').writeFileSync(htmlPath, fullHtml);
  return htmlPath;
}

module.exports = { logHtml, saveHtmlReport, htmlPath };
