const { spawn } = require('child_process');
const { remote } = require('webdriverio');
const prdUploadWorkflow = require('./fileupload'); // no IRD return needed
const {
  overwritePRD,
  getIRD,
  getArticleIds,
  getSerials,
  getTagList
} = require('./Over_write_PRD');
let appiumProcess;

async function startAppium() {
  return new Promise((resolve, reject) => {
    console.log('⏳ Starting Appium server on port 4725...');
    appiumProcess = spawn('appium', ['-p', '4725'], { shell: true });

    appiumProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);
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
  if (appiumProcess) {
    console.log('🛑 Stopping Appium server...');
    appiumProcess.kill();
  }
}
async function launchApp() {
  const opts = {
    path: '/',
    port: 4725,
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
    console.log('📱 App launched successfully!');
    console.log("App Launched", new Date().toLocaleTimeString());
    // Sample login steps — modify as needed
    await browser.$('id=com.blubirch.rims.relianceQAReseller:id/edtEmail').setValue('chetan_rl_q_ex');
    await browser.$('id=com.blubirch.rims.relianceQAReseller:id/edtPassword').setValue('blubirch123');
    await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btnSignIn').click();
    await browser.$('//android.widget.TextView[@resource-id="com.blubirch.rims.relianceQAReseller:id/itemTV" and @text="Item Inward"]').click();
 const ird = getIRD();
 console.log('IRD:', ird);
 await browser.$('id=com.blubirch.rims.relianceQAReseller:id/editText').setValue(ird);
 await browser.pressKeyCode(66); // ENTER key
 await browser.pause(100);
 outerLoop: for (let i = 0; i < Article_IDS.length; i++) {
  const Article_ID = Article_IDS[i];
  await browser.$('//android.widget.EditText[@resource-id="com.blubirch.rims.relianceQAReseller:id/editText" and @text="Article Id/Tag Id"]').setValue(Article_ID);
  await browser.pressKeyCode(66); // ENTER
  for (let j = i; j < Serial1.length; j++) {
    const serial_no1 = Serial1[j];
    await browser.$('//android.widget.EditText[@resource-id="com.blubirch.rims.relianceQAReseller:id/editText" and @text="Item Serial Number"]').setValue(serial_no1);
    await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btnGradeItem').click();
    await browser.pause(100);
    await browser.$('//android.widget.CheckBox[@resource-id="com.blubirch.rims.relianceQAReseller:id/checkbox" and @text="Yes"]').click();
    await browser.pause(100);
    await browser.$('//android.widget.CheckBox[@resource-id="com.blubirch.rims.relianceQAReseller:id/checkbox" and @text="Yes"]').click();
    // await driver.$(properties.CheckBox3).click();
    // if (i === 1 && !permissionHandled) {
    //   const permissionBtn = await driver.$('id=com.android.permissioncontroller:id/permission_allow_foreground_only_button');
    //   if (await permissionBtn.isDisplayed()) {
    //     await permissionBtn.click();
    //     permissionHandled = true;
    //   }
    // }
    // await driver.$('id=com.blubirch.rims.whirlpoolDemo:id/ivCapture').click();
    // await driver.pause(6000);
    // await driver.$('id=com.blubirch.rims.whirlpoolDemo:id/ivConfirm').click();
    await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btNext').click();
    await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btnProceed').click();
    for (let k = j; k < tagList.length; k++) {
      const Tag_name = tagList[k];
      await browser.$('//android.widget.EditText[@resource-id="com.blubirch.rims.relianceQAReseller:id/editText" and @text="Tag ID"]').setValue(Tag_name);
      if (k === tagList.length - 1) {
        await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btnCompleteIRD').click();
        console.log("App Completed time", new Date().toLocaleTimeString());
        break outerLoop;
      } else {
        await browser.$('id=com.blubirch.rims.relianceQAReseller:id/btnAddItem').click();
        await browser.pause(1000);
      }
      continue outerLoop;
    }
  }
}
    // Continue your UI automation after login
    // You can now locate buttons, navigate screens, etc.

  } catch (error) {
    console.error('❌ Failed to launch app:', error);
  } finally {
    if (browser) {
      // await browser.deleteSession();
      console.log(' 🛑 Browser session ended.');
    }
  }
}

// Main execution
(async () => {
  try {
    
    console.log('📤 Starting file upload process...');
    await prdUploadWorkflow(); // 🔁 No IRD return required
    console.log('✅ File upload completed.');
    await startAppium();

    await launchApp(); // 🔁 Just launch app — no IRD passed
  } catch (error) {
    console.error('❌ Error during execution:', error);
  } finally {
    await stopAppium();
  }
})();
