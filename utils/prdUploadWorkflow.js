// utils/prdUploadWorkflow.js
const { firefox } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const Properties = require('../reliance.js');
const {
  overwritePRD,
  getIRD,
  getArticleIds,
  getSerials,
  getTagList
} = require('../Over_write_PRD.js');

const screenshotDir = path.join(__dirname, '../screenshots');
const filePath = path.join(__dirname, '../csv_file', 'RL_PRD.csv');
let success = false;
let browser, context, page, statusText, Upload_ID, screenshotPath;
async function prdUploadWorkflow(test, testInfo) {
  while (!success) {
    try {
      await test.step('♻️ Overwriting PRD file', async () => {
        await overwritePRD();
      });
      await test.step('🦊 Launching Firefox browser', async () => {
        browser = await firefox.launch({ headless: false });
        context = await browser.newContext({ viewport: null });
        page = await context.newPage();
      });

      await test.step('🌐 Navigate to QA URL', async () => {
        await page.goto(Properties.QA_URL);
      });

      await test.step('🧑 Username field is visible and Entered', async () => {
        await page.fill(Properties.usernamefiledW, Properties.usernameW);
      });

      await test.step('🔐Password field is visible and Entered', async () => {
        await page.fill(Properties.passfieldW, Properties.passwordW);
      });

      await test.step('🔓  Sign-In is visible and clicked', async () => {
        await page.click(Properties.signinw);
      });

      await test.step('📂 Sidebar button is visible and clicked', async () => {
        await page.waitForTimeout(3000);
        await page.click(Properties.Sidebar);
      });
      await test.step('📂 PRD tab is visible and clicked', async () => {
        await page.click(Properties.PRD);
      });
      await test.step('📂 Create PRD button is visible and clicked', async () => {
        await page.click(Properties.Create_PRD);
      });
      await test.step('📂 Upload button is visible and clicked', async () => {
        await page.click(Properties.Upload);
      });

      await test.step('📁 Select and Upload PRD File', async () => {
       const fileInput= page.locator(Properties.Select_file);
        await page.waitForTimeout(100);
        await fileInput.setInputFiles(path.resolve(filePath));
        // await new Promise((resolve, reject) => {
        //   exec(`C://autoitfiles/fileupload.exe "${absolutePath}"`, (err) => {
        //     if (err) reject(err);
        //     else resolve();
        //   });
        // });
        await page.waitForTimeout(3000);
        await page.click(Properties.Confirm);
      });

      await test.step('🔄 Wait for upload completion', async () => {
        await page.waitForTimeout(10000);
        await page.reload();
        await page.waitForTimeout(15000);
        await page.reload();
        statusText = (await page.textContent(Properties.File_status)).trim();
      });
      await test.step('✅ File status is Completed and Fetch Upload ID ', async () => {
        if (statusText === 'Completed') {
          success = true;
          await test.step('🆔 Fetch Upload ID',async()=>{
          Upload_ID = await page.textContent(Properties.Upload_id);});
        }
        else if (statusText === 'Import Started') {
          await page.waitForTimeout(3000);
          await page.reload();
          success = true;
        } else {
          global.tagList = [];
        }
      });
      screenshotPath = path.join(screenshotDir, `Uploaded_successfully_${global.IRD}_Upload_ID_${Upload_ID}.png`);
      await test.step('📸 Capture success screenshot', async () => {
        await page.screenshot({ path: screenshotPath, fullPage: true });
      });
      await test.step('❌ Closing browser', async () => {
        await browser.close();
      });
      return {
        IRD: global.IRD,
        TagList: global.tagList,
        ScreenshotPath: screenshotPath
      };
    } catch (error) {
      await browser.close();
      console.error('❌ Error during PRD Upload:', error);
    }
  }

  return {
    IRD: global.IRD,
    TagList: global.tagList
  };
}

module.exports = prdUploadWorkflow;
