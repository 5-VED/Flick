const fs = require('fs');
const path = require('path');

const readFile = async (req, res) => {
  try {
    const srcFilePath = path.join(__dirname, '../../large_file.txt');
    const destDir = path.join(__dirname, '../Files');
    const destFilePath = path.join(destDir, 'large_file_copy.txt');

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir);
    }

    const readStream = fs.createReadStream(srcFilePath);
    const writeStream = fs.createWriteStream(destFilePath);

    readStream.pipe(writeStream);

    writeStream.on('finish', () => {
      return res.status(200).json({
        message: 'File copied successfully',
        success: true,
      });
    });

    fs.readStream.on('error', error => {
      return res.status(500).json({
        message: 'Error reading file',
        success: false,
      });
    });

    writeStream.on('error', error => {
      return res.status(500).json({
        message: 'Error copying file',
        success: false,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
};

module.exports = { readFile };
