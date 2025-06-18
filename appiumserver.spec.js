const { spawn } = require('child_process');
const { remote } = require('webdriverio');
const prdUploadWorkflow = require('./utils/prdUploadWorkflow');
const { test, expect } = require('@playwright/test');
const {
  overwritePRD,
  getIRD,
  getArticleIds,
  getSerials,
  getTagList
} = require('./Over_write_PRD');

let appiumProcess;
let sharedIRD = '';
let sharedTagList = [];
let tagDispositionMap = [];
let ird;
async function startAppium() {
  return new Promise((resolve, reject) => {
    appiumProcess = spawn('appium', ['-p', '4725'], { shell: true });
    appiumProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Appium REST http interface listener started')) resolve();
    });
    appiumProcess.stderr.on('data', (data) => process.stderr.write(data.toString()));
    appiumProcess.on('error', (err) => reject(err));
    appiumProcess.on('exit', (code) => {
      console.log(`🛑 Appium Server stopped with code ${code}.`);
    });
  });
}

async function stopAppium() {
  if (appiumProcess) appiumProcess.kill();
}

async function launchApp() {
  const opts = {
    path: '/',
    port: 4725,
    logLevel: 'error',
    capabilities: {
      platformName: 'Android',
      'appium:platformVersion': '14',
      'appium:deviceName': 'IQOO Neo 6',
      'appium:automationName': 'UiAutomator2',
      'appium:appPackage': 'com.blubirch.rims.relianceQAReseller',
      'appium:appActivity': 'com.blubirch.commons.presentation.login.LoginActivity'
    }
  };

  let browser;
  try {
    browser = await remote(opts);
    test.step('📱 Launching app and initializing session', async () => {
    }); 
    await test.step('✅ Username field is visible and Entered Username ', async () => {
      await browser.$('id=com.blubirch.rims.relianceQAReseller:id/edtEmail').setValue('chetan_rl_q_ex');
    });

    await test.step('✅ Password field is visible and Entered Password', async () => {
      await browser.$('id=com.blubirch.rims.relianceQAReseller:id/edtPassword').setValue('blubirch123');
    });

    await test.step('👆 Sign In button is visible and Clicked on Sign In', async () => {
      await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btnSignIn').click();
    });

    await test.step('🔍 Item Inward tab is visible and Clicked on item inward', async () => {
      await browser.$('//android.widget.TextView[@resource-id="com.blubirch.rims.relianceQAReseller:id/itemTV" and @text="Item Inward"]').click();
    });

     ird = getIRD();
    await test.step(`🧾 IRD field is visible and Enter IRD : ${ird}`, async () => {
      await browser.$('id=com.blubirch.rims.relianceQAReseller:id/editText').setValue(ird);
      await browser.pressKeyCode(66);
    });

    const Article_IDS = getArticleIds();
    const Serial1 = getSerials();
    const tagList = getTagList();

    outerLoop: for (let i = 0; i < Article_IDS.length; i++) {
      const Article_ID = Article_IDS[i];
      const serial_no1 = Serial1[i];
      const tagName = tagList[i];

      await test.step(`📦 Article ID field is visible and Enter Article ID : ${Article_ID}`, async () => {
        await browser.$('//android.widget.EditText[@text="Article Id/Tag Id"]').setValue(Article_ID);
        await browser.pressKeyCode(66);
      });

      await test.step(`🔢 Serial Number field is visible and Enter Serial Number : ${serial_no1}`, async () => {
        await browser.$('//android.widget.EditText[@text="Item Serial Number"]').setValue(serial_no1);
      });
      await test.step('👆 Grade Item Button is visible and clicked on Grade Item Button ',async()=>{
        await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btnGradeItem').click();
        });
        await test.step('📝 Grading the item', async()=>{
        await browser.$('//android.widget.CheckBox[@text="Yes"]').click();
        await browser.pause(100);
        await browser.$('//android.widget.CheckBox[@text="Yes"]').click();
        });
        await test.step('➡️ Next button is enable and clicked on Next button', async()=>{
        await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btNext').click();
        });
        await test.step('✅ Proceed Button is visible and Clicked on Proceed button', async()=>{
        await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btnProceed').click();
      });

      const Disposition = await browser.$('id=com.blubirch.rims.relianceQAReseller:id/tvDisposition').getText();
      tagDispositionMap.push({ tagId: tagName, disposition: Disposition });

      await test.step(`🏷️ Tag ID field is visible and enter Tag ID: ${tagName}`, async () => {
        await browser.$('//android.widget.EditText[@text="Tag ID"]').setValue(tagName);
      });

      if (i === tagList.length - 1) {
        await test.step('✅ Generate GRN button is enable and Clicked on Generate GRN', async () => {
          await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btnGenerateGRN').click();
        });
      } else {
        await test.step('➕ Add item button is enbled And Clicked on Add item button', async () => {
          await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btnAddItem').click();
        });
      }
    }
  } catch (error) {
    console.error('❌ App launch failed:', error);
  } finally {
    if (browser) await browser.deleteSession();
  }
}

test.describe('📦 Full End-to-End Test Flow', () => {
  test.setTimeout(420000);

  test('🌐Step 1: Upload PRD File', async ({}, testInfo) => {
    const { IRD, TagList, ScreenshotPath } = await prdUploadWorkflow(test,testInfo);
    sharedIRD = IRD;
    sharedTagList = TagList;

    testInfo.attachments.push({ name: 'IRD Number', body: Buffer.from(IRD || 'Not Found'), contentType: 'text/plain' });
    testInfo.attachments.push({ name: 'Tag List', body: Buffer.from(TagList?.join('\n') || 'None'), contentType: 'text/plain' });
    if (ScreenshotPath) {
      testInfo.attachments.push({ name: 'Upload Screenshot', path: ScreenshotPath, contentType: 'image/png' });
    }
  });

  test('📱 Step 2: Mobile App Automation via Appium', async ({}, testInfo) => {
    await test.step('🚀 Start Appium Server', async () => {
      await startAppium();
    });

    await test.step('🤖 Run Mobile App Automation', async () => {
      await launchApp();
    });

    await test.step('🛑 Stop Appium Server', async () => {
      await stopAppium();
    });

    const dispositionHtml = `
      <html><body>
        <table border="1" cellspacing="0" cellpadding="5">
          <tr><th>Tag ID</th><th>Disposition</th></tr>
          ${tagDispositionMap.map(entry => `<tr><td>${entry.tagId}</td><td>${entry.disposition}</td></tr>`).join('')}
        </table>
      </body></html>`;

    testInfo.attachments.push({ name: 'Disposition Table', body: Buffer.from(dispositionHtml), contentType: 'text/html' });
  });
});