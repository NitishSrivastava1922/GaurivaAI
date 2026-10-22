import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    // Support the existing local env key as well as AWS's conventional name.
    accessKeyId:
      process.env.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_Id,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});
