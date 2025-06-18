// // utils/prdUploadWorkflow.js

// const { firefox, test } = require('@playwright/test');
// const fs = require('fs');
// const path = require('path');
// const { exec } = require('child_process');
// const Properties = require('./reliance');
// const {
//   overwritePRD,
//   getIRD,
//   getArticleIds,
//   getSerials,
//   getTagList
// } = require('./Over_write_PRD.js');
// const { logHtml } = require('./utils/htmlLogger.js');

// const screenshotDir = path.join(__dirname, '../screenshots');
// const filePath = path.join(__dirname, '../csv_file', 'RL_PRD.csv');
// let success = false;

// async function prdUploadWorkflow(testInfo) {
//   while (!success) {
//     try {
//       await test.step('♻️ Overwriting PRD file', async () => {
//         await overwritePRD();
//       });

//       const browser = await firefox.launch({ headless: false });
//       const context = await browser.newContext({ viewport: null });
//       const page = await context.newPage();

//       await test.step('🌐 Navigate to QA URL', async () => {
//         await page.goto(Properties.QA_URL);
//         logHtml(`✅ Navigated to: ${Properties.QA_URL}`, 'success');
//       });

//       await test.step('🧑 Enter username', async () => {
//         await page.fill(Properties.usernamefiledW, Properties.usernameW);
//         logHtml('✅ Username entered.', 'success');
//       });

//       await test.step('🔐 Enter password', async () => {
//         await page.fill(Properties.passfieldW, Properties.passwordW);
//         logHtml('✅ Password entered.', 'success');
//       });

//       await test.step('🔓 Click Sign-In', async () => {
//         await page.click(Properties.signinw);
//         logHtml('✅ Sign-in clicked.', 'success');
//       });

//       await test.step('⏳ Wait after login', async () => {
//         await page.waitForTimeout(3000);
//       });

//       await test.step('📂 Click Sidebar', async () => {
//         await page.click(Properties.Sidebar);
//         logHtml('✅ Sidebar clicked.', 'success');
//       });

//       await test.step('🆕 Click PRD', async () => {
//         await page.waitForTimeout(100);
//         await page.click(Properties.PRD);
//         logHtml('✅ PRD clicked.', 'success');
//       });

//       await test.step('📤 Click Create PRD', async () => {
//         await page.click(Properties.Create_PRD);
//         logHtml('✅ Create PRD clicked.', 'success');
//       });

//       await test.step('📤 Click Upload button', async () => {
//         await page.click(Properties.Upload);
//         logHtml('✅ Upload clicked.', 'success');
//       });

//       await test.step('📁 Select PRD file', async () => {
//         await page.click(Properties.Select_file);
//         const absolutePath = path.resolve(filePath);
//         await new Promise((resolve, reject) => {
//           exec(`C://autoitfiles/fileupload.exe "${absolutePath}"`, (err) => {
//             if (err) reject(err);
//             else resolve();
//           });
//         });
//         logHtml('✅ File selected for upload.', 'success');
//       });

//       await test.step('⏳ Wait for file processing', async () => {
//         await page.waitForTimeout(3000);
//       });

//       await test.step('✅ Click Confirm upload', async () => {
//         await page.click(Properties.Confirm);
//         logHtml('✅ Confirm clicked.', 'success');
//       });

//       await test.step('🔄 Refresh for upload status', async () => {
//         await page.waitForTimeout(10000);
//         await page.reload();
//         await page.waitForTimeout(15000);
//         await page.reload();
//       });

//       let statusText = await page.textContent(Properties.File_status);
//       statusText = statusText.trim();

//       if (statusText === 'Completed') {
//         success = true;

//         const Upload_ID = await page.textContent(Properties.Upload_id);
//         const screenshotPath = path.join(screenshotDir, `Uploaded_successfully_${global.IRD}_Upload_ID_${Upload_ID}.png`);

//         await test.step('📸 Capture success screenshot', async () => {
//           await page.screenshot({ path: screenshotPath, fullPage: true });
//           logHtml('✅ Screenshot taken for successful upload.', 'success');
//         });

//         await browser.close();
//         return {
//           IRD: global.IRD,
//           TagList: global.tagList,
//           ScreenshotPath: screenshotPath
//         };
//       } else if (statusText === 'Import Started') {
//         await test.step('⏳ Wait for import to proceed', async () => {
//           await page.waitForTimeout(3000);
//           await page.reload();
//         });
//         success = true;
//       } else {
//         global.tagList = [];
//       }

//       await browser.close();
//     } catch (error) {
//       console.error('❌ Error:', error);
//     }
//   }

//   return {
//     IRD: global.IRD,
//     TagList: global.tagList
//   };
// }

// module.exports = prdUploadWorkflow;
