import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env.local');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function getFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 12);
}

function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

export async function uploadToR2(filePath: string): Promise<string> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME || 'personal-website-media';
  const publicUrl = process.env.R2_PUBLIC_URL || '';

  const hash = getFileHash(filePath);
  const filename = path.basename(filePath);
  const ext = path.extname(filePath);
  const key = `media/${hash}/${filename}`;

  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    console.log(`  ⏭  Already exists: ${filename}`);
  } catch {
    const body = fs.readFileSync(filePath);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: getMimeType(ext),
      })
    );
    console.log(`  ✅ Uploaded: ${filename}`);
  }

  return `${publicUrl}/${key}`;
}

export async function uploadMultiple(filePaths: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  for (const fp of filePaths) {
    const url = await uploadToR2(fp);
    results.set(fp, url);
  }
  return results;
}
