import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;

function getClient(): S3Client | null {
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function uploadToR2(key: string, body: Buffer, contentType?: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  await client.send(new PutObjectCommand({ Bucket: bucket!, Key: key, Body: body, ContentType: contentType }));
  return true;
}

export async function existsInR2(key: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket!, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export function getPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL || "";
  return base ? `${base.replace(/\/$/, "")}/${key}` : "";
}

export function hasR2Config(): boolean {
  return !!(accountId && accessKeyId && secretAccessKey && bucket);
}
