const core = require('@actions/core');
const fs = require('fs');

const checkBundleSize = dir => {
  const BUNDLE_BUDGET = parseInt(core.getInput('bundleBudget'))
  console.log(`Bundle budget is ${BUNDLE_BUDGET}`)
  if (fs.existsSync(dir)) {
    const statsFile = fs.readFileSync(`${dir}/${getStatsFile(dir)}`);
    console.log(`try to read file at ${dir}/${getStatsFile(dir)}`)
    const bundlebytes = JSON.parse(statsFile).totalMinifiedBytes;
    if (bundlebytes >= BUNDLE_BUDGET) {
      return { passed: false, difference: formatBytes(bundlebytes - BUNDLE_BUDGET) };
    } else {
      return { passed: true, difference: formatBytes(BUNDLE_BUDGET - bundlebytes) };
    }
  }
  else{
    throw Error(`${dir} doesn't exist`)
  }
};

const getStatsFile = dir => {
  const dirCont = fs.readdirSync(dir);
  const statsFile = dirCont.filter(elm => {
    return elm.endsWith('.stats.json');
  });
  if (!statsFile) {
    throw Error(`no stat file found in ${dir}`);
  }
  if (statsFile.length != 1) {
    throw Error(`multiple stat files found in ${dir}`);
  }
  if (statsFile.length == 1) return statsFile[0];
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  if (bytes === 1) {
    return '1 Byte';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

try {
  const buildDir = core.getInput('buildDir')
  const appPath = core.getInput('appPath')

  const modernBundlePath = `${appPath}/${buildDir}/bundle/programs/web.browser`;
  const legacyBundlePath = `${appPath}/${buildDir}/bundle/programs/web.browser.legacy`;

  console.log(`modernBundlePath is ${modernBundlePath}`)
  console.log(`legacyBundlePath is ${legacyBundlePath}`)

  const modernResult = checkBundleSize(modernBundlePath);
  console.log(`modernResult is ${{modernResult}}`)
  const legacyResult = checkBundleSize(legacyBundlePath);
  console.log(`modernResult is ${{legacyResult}}`)


  core.setOutput("status", modernResult.passed && legacyResult.passed);
  if(!modernResult.passed && !legacyResult.passed){
    const message = `You've exceeded modern bundle size budget by ${modernResult.difference}, and legacy bundle size budget by ${legacyResult.difference}`
    core.setOutput('messsage',message)
    core.setFailed(message)
  }
  if(!modernResult){
    const message = `You've exceeded modern bundle size budget by ${modernResult.difference}`
    core.setOutput('messsage',message)
    core.setFailed(message)
  }
  if(!legacyResult){
    const message = `You've exceeded modern bundle size budget by ${modernResult.difference}`
    core.setOutput('messsage',message)
    core.setFailed(message)
  }
  const successMessage = 'You haven\'t exceeded the bundle size budget'
  console.log(successMessage)
  core.setOutput('message',successMessage)
} catch (error) {
  core.setFailed(`Action failed with error ${error}`);
}






