# write  a progrm  in python thath get connected to AWS IOT SITEWISE  using the aws iot sdk and send paylaod to the aws iotsite tah tconsisteds of loaction , sensor_type, device_id, timestamps and value .
import boto3
import json
import time
import random

# Initialize AWS IoT Data client
client = boto3.client('iotsitewise')

# Define the payload data
payload = {
    'location': 'New York',
    'sensor_type': 'temperature',
    'device_id': 'XXXXXXXXXX',
    'timestamp': int(time.time()),
    'value': random.uniform(20, 30)
}

# Convert the payload to JSON
payload_json = json.dumps(payload)

# Publish the payload to AWS IoT SiteWise
response = client.publish(
    topic='sensors/temperature',
    payload=payload_json
)

# Print the response
print(response)