import * as fs from 'fs';
import * as path from 'path';

/**
 * To copy over all of the files from one directory to another
 * @param sourceDir Source directory
 * @param destinationDir Target/Destination directory
 */
export function copyFiles(sourceDir: string, destinationDir: string) {
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  let entries = fs.readdirSync(sourceDir, {
    withFileTypes: true,
  });

  for (let entry of entries) {
    let srcPath = path.join(sourceDir, entry.name);
    let destPath = path.join(destinationDir, entry.name);

    entry.isDirectory() ?
      copyFiles(srcPath, destPath) :
      fs.copyFileSync(srcPath, destPath);
  }
}