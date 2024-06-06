const net = require("net");
const AWS = require("aws-sdk");
const amqp = require("amqplib/callback_api");

AWS.config.update({ region: "ap-south-1" }); 

const dynamoDB = new AWS.DynamoDB();

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
console.log("check1");
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    const messagequeue = "message_queue";
    const commandqueue="command_queue"
    channel.assertQueue(messagequeue, {
      durable: false,
    });
    channel.consume(commandqueue,function(msg){
      if (msg !== null) {
        //console.log(msg.content);
        //let json_command= JSON.parse(msg.content.toString('utf-8')); // Convert Buffer to JSON
        let json_string = msg.content.toString("utf-8");

        console.log("json string", typeof(json_string));

        try {
            let json_object = JSON.parse(json_string);
            console.log("json object", typeof(json_object));
            console.log("Parsed JSON:", json_object);
            const params = {
              TableName: "ems-mvp-commandhistory",
              Item: {},
            };
    
            // Add each parameter with its random value to DynamoDB params
            Object.entries(json_object).forEach(([key, value]) => {
              params.Item[key] = { S: String(value) };
            });
    
            // Put item into DynamoDB
            dynamoDB.putItem(params, function (err, data) {
              if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
              } else {
                console.log("Added item on Command history table");
              }
            });
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
        
    }
    
    
;
    })
    const server = net.createServer((socket) => {
      console.log(
        `Client connected from ${socket.remoteAddress}:${socket.remotePort}`
      );
      socket.on("data", (data) => {
        const hexdata=data.toString();
        console.log("Length",hexdata.length)
        if(hexdata.length!=34)
            {
                const confirmation=hexdata.substring(18,20);
                const buffer = Buffer.alloc(4);
                  buffer.writeUInt32BE(parseInt(confirmation, 16), 0);
                  socket.write(buffer);
            }
        else{
            const confirmation=Buffer.from([0x01]);
            socket.write(confirmation);
        }
        channel.sendToQueue(messagequeue, Buffer.from(data.toString()));
        console.log("Message enqueued to RabbitMQ:", data.toString());
      });
      socket.on("error", (err) => {
        console.error(`Socket error: ${err.message}`);
      });

      socket.on("end", () => {
        console.log(
          `Client disconnected from ${socket.remoteAddress}:${socket.remotePort}`
        );
      });
    });
    server.on("error", (err) => {
        console.error(`Server error: ${err.message}`);
      });
      server.on("unexpected-response", (request, response) => {
        console.error("Unexpected response:", response.statusCode);
      });
  
      let connections = new Set();
  
      server.on("connection", (socket) => {
        connections.add(socket);
        socket.on("close", () => {
          connections.delete(socket);
        });
      });
  
      server.listen(1234, () => {
        console.log("Server listening on port 1234");
      });
  
      function closeServer() {
        console.log("Closing server...");
  
        server.close(() => {
          console.log("Server shut down.");
        });
  
        for (let socket of connections) {
          socket.destroy();
          connections.delete(socket);
        }
              connection.close(function() {
          console.log("RabbitMQ connection closed.");
          process.exit(0);
        });
      }
      process.on("SIGINT", closeServer);
    });
  });