const glob = require("glob");
const fs =  require('fs');
const JSZip = require("jszip");

async function createZipFileFromDirectory(path) {
  const zip = new JSZip();

  const filePaths = await new Promise((res) => {
    glob(path + '/**/*', {nodir: true}, (err, paths) => {res(paths);});
  })
  const files = await Promise.all(filePaths.map((filePath) =>
    new Promise(res => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        res([filePath, data]);
      });
    }))
  )
  files.forEach(([path, data]) => {
    zip.file(path, data);
  })
  return await zip.generateAsync({ type: 'string' });
}

module.exports = {
  async interactive() {
    // const settings = await buildAppUploadSettings()
    // console.log(settings);
    const zipFile = await createZipFileFromDirectory('./example')
    console.log(zipFile);
  },
  async nonInteractive() {
    console.log("NON-INTERACTIVE UPLOAD")
  }
}
