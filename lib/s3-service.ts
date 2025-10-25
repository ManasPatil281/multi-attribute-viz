import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET } from './aws-config';

export async function uploadCSVToS3(
  file: Buffer,
  fileName: string,
  username: string
): Promise<string> {
  const key = `csv-files/${username}/${Date.now()}-${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: 'text/csv',
    })
  );

  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
