// singleMsgMqtt_SecretManager.js
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import awsIot from 'aws-iot-device-sdk';



// AWS Region for Secrets Manager
const region = process.env.AWS_REGION;


// Your AWS IoT endpoint (replace if needed)
const ioT_End_Point = process.env.IOT_END_POINT //'a5b18sm2w1aeo-ats.iot.us-east-1.amazonaws.com';

// Name or ARN of your secret in AWS Secrets Manager
const secretId = 'iOTCertificates';


const secretsClient = new SecretsManagerClient({ region });
// Configure AWS SDK (make sure your environment has credentials to read Secrets Manager)


/**
 * Fetch IoT certificates from Secrets Manager
 */
async function getIoTCertificates() {
  // 1. Retrieve the secret
  const data = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretId })
  );

  // 2. Parse the JSON from data.SecretString
  const { iotPrivateKey, iotDeviceCert, iotRootCA } = JSON.parse(data.SecretString);

  return {
    privateKey: iotPrivateKey,
    clientCert: iotDeviceCert,
    caCert: iotRootCA,
  };
}

/**
 * Main function to connect to AWS IoT using in-memory certs
 * and publish a single message to the 'iot/sub' topic.
 */
async function main() {
  try {
    // 1. Fetch certificates from Secrets Manager
    const { privateKey, clientCert, caCert } = await getIoTCertificates();

    // 2. Create the AWS IoT device connection (from aws-iot-device-sdk)
    //    We pass raw PEM strings instead of file paths.
    const device = awsIot.device({
      privateKey,
      clientCert,
      caCert,
      clientId: 'iOTestID',
      host: 'a5b18sm2w1aeo-ats.iot.us-east-1.amazonaws.com' // Replace if your endpoint differs
    });

    // 3. When connected, publish a random sensor reading
    device.on('connect', function() {
      console.log('Connected to AWS IoT Core');
      
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
      console.error('IoT Device Error:', error);
    });
    
  } catch (err) {
    console.error('Error in main():', err);
  }
}

// Run the main function
main();