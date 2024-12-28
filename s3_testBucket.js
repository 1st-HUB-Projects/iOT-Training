const AWS = require('aws-sdk');

// Option A: Let the SDK automatically pick up environment variables
// If AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION are set,
// then AWS SDK will automatically use them. You don't need extra config.

// Option B: Explicitly configure region if needed
AWS.config.update({
  region: process.env.AWS_REGION
});

// Now you can use the AWS SDK as usual, e.g.:
const s3 = new AWS.S3();