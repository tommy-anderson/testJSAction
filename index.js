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

  console.log(`modernBundlePath is ${modernBundlePath}`)

  const modernResult = checkBundleSize(modernBundlePath);

  console.log(`passed -  ${modernResult.passed}`)
  console.log(`difference - ${modernResult.difference}`)

  core.setOutput("status", modernResult.passed);
  if(!modernResult.passed){
    const message = `You've exceeded bundle size budget by ${modernResult.difference}`
    core.setOutput('message',message)
    core.setFailed(message)
  }
  else {
    const successMessage = `You haven\'t exceeded the bundle size budget, you still got ${modernResult.difference} of wiggle room`
    console.log(successMessage)
    core.setOutput('message',successMessage)
  }
  
} catch (error) {
  core.setFailed(`Action failed with error ${error}`);
}






