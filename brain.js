const AWS = require('aws-sdk');
const amqp = require("amqplib/callback_api");

// Function to query DynamoDB and process data
function queryAndProcessData(channel) {
  dynamodb.query(params, function(err, data) {
    if (err) {
      console.error('Unable to query DynamoDB. Error:', JSON.stringify(err, null, 2));
      return;
    }

    if (data.Items.length === 0) {
      console.log('No datapacket found for the specified key.');
      return;
    }

    const dynamodata = data.Items[0];
    const soc = dynamodata["SoC %"] ? parseInt(dynamodata["SoC %"].S) : null;
    const current = dynamodata["Pack Current"] ? parseInt(dynamodata["Pack Current"].S) : null;
    const timestamp = dynamodata["Timestamp"] ? dynamodata["Timestamp"].S : null;

    console.log("Required details:", soc, current, timestamp);

    if (soc !== null && current !== null && timestamp !== null) {
      const cmd = sendCommand(soc, current, timestamp);
      console.log("Command to be sent:", cmd);
      let json_command = {"Timestamp":timestamp.toString(),"essID":dynamodata["essID"].S,"command":cmd.toString()};
      // Publish the command to RabbitMQ
      channel.sendToQueue(commandqueue, Buffer.from(JSON.stringify(json_command)));
      console.log("Command published to RabbitMQ:", json_command);
    } else {
      console.log('One or more required details are missing.');
    }
  });
}

// Function to send command based on data from DynamoDB
function sendCommand(soc, current, timestamp) {
  const newtimestamp = new Date(timestamp);
  const month = newtimestamp.getMonth() + 1; // Adding 1 because getMonth() returns 0-based index (0 for January)
  const hour = newtimestamp.getHours();

  console.log(hour, month);

  if (current <= 0) {   // discharging
    if (soc < 50) return "STARTCHARGING";
    else {
      const tod_value = npcl_tod[hour][month];
      if (soc < chargeLimit[tod_value]) return "STARTCHARGING";
    }
  } else {   // charging
    if (soc >= 90) return "STOPCHARGING";
    else {
      const tod_value = npcl_tod[hour][month];
      if (soc >= chargeLimit[tod_value]) return "STOPCHARGING";
    }
  }
  return "DONOTHING";
}

AWS.config.update({
  region: 'ap-south-1'
});

// Create DynamoDB service object
const dynamodb = new AWS.DynamoDB();

const params = {
  TableName: 'ems-mvp-datadump',
  KeyConditionExpression: 'essID = :EssId',
  ExpressionAttributeValues: {
    ':EssId': { S: 'ESS #001' } // Correct format: Object with type and value
  },
  Limit: 1,
  ScanIndexForward: false
};

const chargeLimit = [50, 75, 90];
const npcl_tod=[
  [2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2],
  [2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2],
  [2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2],
  [2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2],
  [1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1],
  [1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1],
  [1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1],
  [1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1],
  [1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1],
  [1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2],
  [2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2]
];

const commandqueue = "command_queue";

// Connect to RabbitMQ for brainqueue
amqp.connect("amqp://localhost", function(error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    channel.assertQueue(commandqueue, {
      durable: false,
    });



    // Set interval to query DynamoDB and publish commands to RabbitMQ
    setInterval(() => queryAndProcessData(channel), 5000); // Every 1 minute
  });
});
