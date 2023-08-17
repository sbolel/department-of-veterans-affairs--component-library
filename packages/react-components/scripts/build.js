/* eslint-disable no-console */
const rimraf = require('rimraf');
const glob = require('glob');
const fs = require('fs-extra');
const babel = require('@babel/core');
const recast = require('recast');
const path = require('path');

console.log('Starting component-library build');
console.log('Cleaning old build');
rimraf.sync('./[.]*!(index).js');

// this comes from gulp-flatten-requires
// https://github.com/insin/gulp-flatten-requires/blob/master/index.js
// Flattens paths given to require
/* eslint-disable */
function flattenRequires(bufferString) {
  return new Buffer(
    recast.print(
      recast.visit(recast.parse(bufferString), {
        visitCallExpression: function (path) {
          this.traverse(path);
          var expr = path.node;
          if (expr.callee.name == 'require') {
            if (
              expr.arguments.length &&
              expr.arguments[0].value.charAt(0) == '.'
            ) {
              var arg = expr.arguments[0];
              expr.arguments[0] =
                arg.raw.charAt(0) +
                './' +
                arg.value.split('/').pop() +
                arg.raw.charAt(0);
            }
          } else {
            return false;
          }
        },
      }),
    ).code,
  );
}
/* eslint-enable */
/* eslint-disable no-console */

const rootPath = path.resolve(__dirname, '..');
const configFile = path.join(rootPath, 'config/babel.config.js');
const packageFile = path.resolve(__dirname, '../package.json');

const envConf = new Map();
envConf.set('browser', { outDir: './dist' });
envConf.set('es', { outDir: './lib' });
const envList = Array.from(envConf.keys());

// get a flat array of file paths
const fileNames = [].concat.apply(
  [],
  [
    glob.sync('./src/*.@(js|jsx)'),
    glob.sync('./src/components/**/*.@(js|jsx)', {
      ignore: ['./**/*.unit.spec.@(js|jsx)', './**/*.stories.@(js|jsx)'],
    }),
    glob.sync('./src/helpers/*.js'),
    glob.sync('../core/src/i18n/**/*.js'),
  ],
);

const runBuildForTarget = async ({ envName, filename }) => {
  console.debug(`Beginning build for target: ${envName}`);

  babel.loadPartialConfig({
    configFile,
    envName,
  });

  const { outDir } = envConf.get(envName);
  const outputDirectoryPath = path.join(rootPath, outDir);
  const outputFileName = `${path.parse(filename).name}.js`;
  const outputFilePath = path.join(outputDirectoryPath, outputFileName);

  // read a file into a buffer
  const buffer = await fs.readFile(filename);

  // transform the buffer with babel using babelrc
  const babelTransformedBuffer = babel.transform(buffer, {
    configFile,
  }).code;
  // flatten paths given to all requires
  const requireFlattenedBuffer = flattenRequires(
    babelTransformedBuffer.toString(),
  );

  // write file to main package folder
  return fs
    .outputFile(outputFilePath, requireFlattenedBuffer)
    .then(() => {
      console.log(`${outputFileName} built`);
    })
    .catch(err => {
      console.error(`${outputFileName} build failed!`, err);
    });
};

const runBuildForTargetSync = ({ envName, filename }) => {
  console.debug(`Beginning sync build for target: ${envName}`);

  process.env.BABEL_ENV = envName;
  babel.loadPartialConfig({
    configFile,
    envName,
  });

  const { outDir } = envConf.get(envName);
  const outputDirectoryPath = path.join(rootPath, outDir);
  const outputFileName = `${path.parse(filename).name}.js`;
  const outputFilePath = path.join(outputDirectoryPath, outputFileName);

  // read a file into a buffer
  const buffer = fs.readFileSync(filename);

  // transform the buffer with babel using babelrc
  const babelTransformedBuffer = babel.transform(buffer, {
    configFile,
  }).code;

  // flatten paths given to all requires
  const requireFlattenedBuffer = flattenRequires(
    babelTransformedBuffer.toString(),
  );

  // write file to main package folder
  fs.outputFileSync(outputFilePath, requireFlattenedBuffer);
  console.log(`${outputFileName} built`);
};

async function build() {
  const envName = babel.loadOptions().envName;
  const isTargetEnv = (envName && envConf.has(envName)) || false;
  const buildList = isTargetEnv && envName ? [envName] : [...envList];

  console.log(
    `Beginning component-library build for ${buildList.join(', ')} environment${
      buildList.length > 1 ? 's' : ''
    }.`,
  );

  if (false) {
    await Promise.all(
      buildList.map(envName => {
        console.log(`Ensuring build directory for ${envName} env...`);
        const outDir = envConf.get(envName).outDir;
        return fs.ensureDir(outDir);
      }),
    );

    console.log(
      `Build directories ensured. Found ${fileNames.length} files to build.`,
    );

    const promises = buildList
      .map(envName => {
        console.log(`Enumerating ${envName} env files and transpiling...`);
        return fileNames.map(filename => {
          console.log(`Transpiling ${filename} for ${envName} build.`);
          return runBuildForTarget({ envName, filename });
        });
      })
      .flat()
      .concat(() =>
        fs.copyFile(
          packageFile,
          `./${envConf.get(envName).outDir}/package.json`,
        ),
      );

    await Promise.all(promises);
  }

  buildList.forEach(envName => {
    console.log(`Ensuring build directory for ${envName} env...`);
    const outDir = envConf.get(envName).outDir;

    fs.ensureDirSync(outDir);

    console.log(`Enumerating ${envName} env files and transpiling...`);

    fileNames.forEach(filename => {
      console.log(`Transpiling ${filename} for ${envName} build.`);
      runBuildForTargetSync({ envName, filename });
    });

    fs.copyFileSync(
      packageFile,
      `./${envConf.get(envName).outDir}/package.json`,
    );
  });

  // .concat(() =>
  // fs.copyFile(packageFile, `./${envConf.get(envName).outDir}/package.json`),
  // );
}

build();
