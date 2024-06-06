const amqp = require("amqplib/callback_api");
const AWS = require("aws-sdk");

// Set the region for DynamoDB
AWS.config.update({ region: "ap-south-1" }); 

// Create DynamoDB service object
const dynamoDB = new AWS.DynamoDB();

// Function to generate random value within a range
const generateRandomValue = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    const messagequeue = "message_queue";
    const brainQueue = "brain_queue";
    channel.assertQueue(messagequeue, {
      durable: false,
    });

    console.log("Waiting for messages in the queue...");

    // Consume messages from the queue
    channel.consume(
      messagequeue,
      function (msg) {
        if (msg !== null) {
          // Log received message
          console.log("Received message:", msg.content.toString());

          // Process the message here
          const receivedMessage = msg.content.toString(); // Received message content as string
          const essId = "ESS #001"; // Generate unique Ess-Id
          const timestamp = new Date(); // Get current timestamp in local time

          // Adjust timestamp to UTC + 5 hours 30 minutes
          timestamp.setUTCHours(timestamp.getUTCHours() + 5); // Add 5 hours
          timestamp.setUTCMinutes(timestamp.getUTCMinutes() + 30); // Add 30 minutes
          const adjustedTimestamp = timestamp.toISOString();
          const senttobrain=false;
          // Generate random values for each parameter
          const data = {
            "essID": essId,
            "Timestamp": adjustedTimestamp,
            "Pack Voltage": generateRandomValue(200, 250),
            "Pack Current": generateRandomValue(-50,50),
            "Cell1 Voltage": generateRandomValue(3, 4),
            "Cell2 Voltage": generateRandomValue(3, 4),
            "Cell3 Voltage": generateRandomValue(3, 4),
            "Cell4 Voltage": generateRandomValue(3, 4),
            "Cell5 Voltage": generateRandomValue(3, 4),
            "Cell6 Voltage": generateRandomValue(3, 4),
            "Cell7 Voltage": generateRandomValue(3, 4),
            "Cell8 Voltage": generateRandomValue(3, 4),
            "Cell9 Voltage": generateRandomValue(3, 4),
            "Cell10 Voltage": generateRandomValue(3, 4),
            "Cell11 Voltage": generateRandomValue(3, 4),
            "Cell12 Voltage": generateRandomValue(3, 4),
            "Cell13 Voltage": generateRandomValue(3, 4),
            "Cell14 Voltage": generateRandomValue(3, 4),
            "Cell15 Voltage": generateRandomValue(3, 4),
            "Cell16 Voltage": generateRandomValue(3, 4),
            "Cell1 Temp": generateRandomValue(20, 40),
            "Cell2 Temp": generateRandomValue(20, 40),
            "Cell3 Temp": generateRandomValue(20, 40),
            "Cell4 Temp": generateRandomValue(20, 40),
            "Cumulative Charge": generateRandomValue(500, 1000),
            "Cumulative Discharge": generateRandomValue(500, 1000),
            "Cycle count Nos": generateRandomValue(100, 200),
            "Internal temp": generateRandomValue(20, 40),
            "SoC %": generateRandomValue(10, 90),
            "SoH %": generateRandomValue(0, 100),
            "Cell Temp Max": generateRandomValue(20, 40),
            "Internal Temp": generateRandomValue(20, 40),
            "Total Capacity": generateRandomValue(1000, 2000),
            "Serial Number": "SN12345",
            "MOSFET Temp": generateRandomValue(20, 40),
            "Remaining cycle Nos": generateRandomValue(50, 100),
            "Remaining Energy": generateRandomValue(500, 1000),
            "I&C Date": new Date().toISOString(),
            "BMS Ver": "1.0",
            "Status Charge/Discharge/Standby": "Charge",
            "Warning": "No",
            "Protection": "Yes",
            "Error code": "0"
          };
          //Send to brainqueue
          console.log(data);
          // Define DynamoDB params
          const params = {
            TableName: "ems-mvp-datadump",
            Item: {},
          };

          // Add each parameter with its random value to DynamoDB params
          Object.entries(data).forEach(([key, value]) => {
            params.Item[key] = { S: String(value) };
          });

          // Put item into DynamoDB
          dynamoDB.putItem(params, function (err, data) {
            if (err) {
              console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
              console.log("Added item on", JSON.stringify(adjustedTimestamp, null, 2));
            }
          });

          // Acknowledge the message
          channel.ack(msg);
        }
      },
      {
        noAck: false, // Set noAck to false to manually acknowledge messages
      }
    );
  });
});

