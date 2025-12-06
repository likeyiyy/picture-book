import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    // 生成唯一的文件名
    const timestamp = Date.now();
    const filename = `image-${timestamp}.jpg`;

    // 使用 Sharp 处理图片
    const processedBuffer = await sharp(buffer)
      .resize(800, 800, { // 调整为绘本标准尺寸
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // 保存处理后的图片
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, processedBuffer);

    // 返回图片 URL
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      data: { url: imageUrl }
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process image' },
      { status: 500 }
    );
  }
}