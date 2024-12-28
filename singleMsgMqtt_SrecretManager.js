const awsIot = require('aws-iot-device-sdk');
const AWS = require('aws-sdk');

// AWS Region for Secrets Manager
const region = 'us-east-1';

// Your AWS IoT endpoint (replace if needed)
const ioT_End_Point = 'a5b18sm2w1aeo-ats.iot.us-east-1.amazonaws.com';

// Name or ARN of your secret in AWS Secrets Manager
const secretId = 'iOTCertificates';

// Configure AWS SDK (make sure your environment has credentials to read Secrets Manager)
AWS.config.update({ region });
const secretsManager = new AWS.SecretsManager();

/**
 * Fetch IoT certificates from Secrets Manager
 */
async function getIoTCertificates() {
  const data = await secretsManager.getSecretValue({ SecretId: secretId }).promise();
  const { iotPrivateKey, iotDeviceCert, iotRootCA } = JSON.parse(data.SecretString);

  // Return them in a format aws-iot-device-sdk expects
  return {
    privateKey: iotPrivateKey,
    clientCert: iotDeviceCert,
    caCert: iotRootCA,
  };
}

(async () => {
  try {
    // 1. Fetch certificates from Secrets Manager
    const { privateKey, clientCert, caCert } = await getIoTCertificates();

    // 2. Create the AWS IoT device with in-memory certificates
    const device = awsIot.device({
      privateKey,       // Private key PEM content
      clientCert,       // Device certificate PEM content
      caCert,           // Root CA PEM content
      clientId: 'iOTestID',
      host: ioT_End_Point,
    });

    // 3. Set up event handlers
    device.on('connect', function() {
      console.log('Connected to AWS IoT Core');

      // Prepare a single message to publish
      const payload = JSON.stringify({
        temperature: (Math.random() * 10 + 20).toFixed(2), // Random temperature
        pressure: (Math.random() * 200 + 900).toFixed(2),  // Random pressure
        device_id: `device_${Math.floor(Math.random() * 5) + 1}`
      });

      // Publish to the topic 'iot/sub'
      device.publish('iot/sub', payload);
      console.log('Message sent:', payload);
    });

    device.on('error', function(error) {
      console.error('Error:', error);
    });

  } catch (error) {
    console.error('Error setting up IoT device:', error);
  }
})();
