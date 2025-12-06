import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 确保目录存在
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 本地存储目录
const IMAGE_STORAGE_DIR = path.join(process.cwd(), 'public', 'generated-images');

// 初始化存储目录
ensureDir(IMAGE_STORAGE_DIR);

/**
 * 从 URL 下载图片并保存到本地
 * @param imageUrl 图片的远程 URL
 * @param filename 可选的文件名，如果不提供则自动生成
 * @returns 本地图片的 URL
 */
export async function downloadAndSaveImage(imageUrl: string, filename?: string): Promise<string> {
  try {
    // 生成唯一文件名
    const fileExtension = imageUrl.includes('.jpg') ? '.jpg' :
                          imageUrl.includes('.jpeg') ? '.jpeg' :
                          imageUrl.includes('.png') ? '.png' : '.jpg';

    const uniqueFilename = filename || `${uuidv4()}${fileExtension}`;
    const localPath = path.join(IMAGE_STORAGE_DIR, uniqueFilename);

    // 下载图片
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // 保存到本地
    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        // 返回本地访问的 URL
        const localUrl = `/generated-images/${uniqueFilename}`;
        console.log(`Image downloaded and saved: ${localUrl}`);
        resolve(localUrl);
      });

      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Failed to download image');
  }
}

/**
 * 清理旧的图片文件（可选）
 * @param maxAge 最大保留时间（毫秒）
 */
export function cleanupOldImages(maxAge: number = 24 * 60 * 60 * 1000) { // 默认24小时
  try {
    const files = fs.readdirSync(IMAGE_STORAGE_DIR);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(IMAGE_STORAGE_DIR, file);
      const stats = fs.statSync(filePath);

      // 如果文件超过最大保留时间，删除它
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old image: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old images:', error);
  }
}

// 定期清理（每小时执行一次）
setInterval(() => {
  cleanupOldImages();
}, 60 * 60 * 1000);