// s3_testBucket.js (using v3)
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

async function listS3Buckets() {
  // Create an S3Client. Region can come from environment variables if set.
  const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

  try {
    // Send the command to the S3 client
    const data = await s3Client.send(new ListBucketsCommand({}));
    console.log('Buckets:', data.Buckets);
  } catch (error) {
    console.error('Error listing buckets:', error);
  }
}

listS3Buckets();
