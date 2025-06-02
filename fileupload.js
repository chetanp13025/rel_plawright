// prd_upload.js - Playwright version of PRD_upload.java

const { firefox } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const Properties = require('./reliance'); // Contains selectors and config
const {
  overwritePRD,
  getIRD,
  getArticleIds,
  getSerials,
  getTagList
} = require('./Over_write_PRD');
const appium =require('./appiumserver');

const filePath = path.join(__dirname, 'csv_file', 'RL_PRD.csv');
let success = false;

async function prdUploadWorkflow() {
  while (!success) {
    try {
      // Step 1: Overwrite PRD file
      await overwritePRD();
      console.log('IRD:', global.IRD);
      console.log('SKU Codes:', global.Article_IDS);
      console.log('Serial Numbers:', global.Serial1);
      console.log('Tag List:', global.tagList);

      // Step 2: Launch browser
      const browser = await firefox.launch({ headless: false });
      const context = await browser.newContext({ viewport: null });
      const page = await context.newPage();

      // Step 3: Login
      await page.goto(Properties.QA_URL);
      await page.fill(Properties.usernamefiledW, Properties.usernameW);
      await page.fill(Properties.passfieldW, Properties.passwordW);
      await page.click(Properties.signinw);
      await page.waitForTimeout(3000);

      // Step 4: Navigate and Upload PRD
      await page.click(Properties.Sidebar);
      await page.waitForTimeout(100);
      await page.click(Properties.PRD);
      await page.click(Properties.Create_PRD);
      await page.click(Properties.Upload);
      await page.click(Properties.Select_file);

      const absolutePath = path.resolve(filePath);
      await new Promise((resolve, reject) => {
        exec(`C://autoitfiles/fileupload.exe "${absolutePath}"`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await page.waitForTimeout(3000);
      await page.click(Properties.Confirm);
      await page.waitForTimeout(10000);
      await page.reload();
      await page.waitForTimeout(15000);
      await page.reload();
      await page.waitForTimeout(1000);

      const statusText = await page.textContent(Properties.File_status);

      if (statusText.trim() === 'Completed') {
        console.log('✅ Status:', statusText);
        success = true;
        await appium();
      } else if (statusText.trim() === 'Import Started') {
        console.log('ℹ️ Status:', statusText);
        await page.waitForTimeout(3000);
        await page.reload();
        success = true;
      } else {
        console.log('❌ Status:', statusText);
        global.tagList = [];
      }

      await browser.close();
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

module.exports = prdUploadWorkflow;
