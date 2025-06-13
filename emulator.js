const { execSync, spawn } = require('child_process');
const AVD_NAME = 'myEmulator';
const PACKAGE_NAME = 'system-images;android-30;google_apis;x86_64';

try {
  // Step 1: Install system image (if not already installed)
  console.log('Installing system image...');
  execSync(`sdkmanager "${PACKAGE_NAME}"`, { stdio: 'inherit' });

  // Step 2: Create AVD (if it doesn't exist)
  console.log('Creating AVD...');
  execSync(`echo no | avdmanager create avd -n ${AVD_NAME} -k "${PACKAGE_NAME}" --device "pixel"`, {
    stdio: 'inherit'
  });

  // Step 3: Start Emulator
  console.log('Starting emulator...');
  const emulatorProcess = spawn('emulator', ['-avd', AVD_NAME], {
    detached: true,
    stdio: 'ignore'
  });

  emulatorProcess.unref();

  console.log(`Emulator "${AVD_NAME}" started.`);
} catch (err) {
  console.error('❌ Error creating or starting emulator:', err.message);
}
