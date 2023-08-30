const fs = require('fs');
const path = require('path');
const got = require('got');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

async function processFile(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const imageUrls = [];

    // Find all markdown image notations and extract URLs using regex
    const imageUrlRegex = /!\[[^\]]*]\((.*?)\)/g;
    let match;
    while ((match = imageUrlRegex.exec(content)) !== null) {
      const imageUrl = match[1];
      if (imageUrl) {
        const decodedImageUrl = decodeURIComponent(imageUrl);
        imageUrls.push(decodedImageUrl);
      }
    }

    return imageUrls;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return [];
  }
}

async function downloadImage(imageUrl, outputFolder) {
  try {
    const response = await got.get(imageUrl, { responseType: 'buffer' });
    const extension = path.extname(imageUrl);
    const imageFileName = path.basename(imageUrl, extension);
    const outputPath = path.join(outputFolder, `${imageFileName}${extension}`);

    await writeFile(outputPath, response.body);

    console.log(`Downloaded ${imageUrl} to ${outputPath}`);
  } catch (error) {
    console.error(`Error downloading ${imageUrl}:`, error);
  }
}

async function processFolder(folderPath, outputFolder) {
  try {
    const files = await readdir(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        await processFolder(filePath, outputFolder);
      } else if (fileStat.isFile() && path.extname(filePath) === '.md') {
        const imageUrls = await processFile(filePath);
        for (const imageUrl of imageUrls) {
          await downloadImage(imageUrl, outputFolder);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing folder ${folderPath}:`, error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: mdimg <folder>');
    return;
  }

  const folderPath = args[0];
  const outputFolder = 'downloaded_images';

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  console.log(`Path: ${folderPath}. Output: ${outputFolder}`);
  await processFolder(folderPath, outputFolder);
}

main();
