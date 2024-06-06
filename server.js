const net = require("net");
const num_of_data_start=18;
const num_of_data_end=20;
const server = net.createServer((socket) => {
  console.log(`Client connected from ${socket.remoteAddress}:${socket.remotePort}`);
  socket.on("data", (data) => {
              console.log('data :',data);
          const hexdData=data.toString("hex");
          //fs.appendFileSync("output.txt", hexdData + "\n");
          const value =hexdData.slice(num_of_data_start,num_of_data_end);
                  const buffer = Buffer.alloc(4);
                  buffer.writeUInt32BE(parseInt(value, 16), 0);
          console.log(hexdData);
        // fs.appendFileSync("data.txt", hexdData + "\n");
          if(hexdData.length!=34){
                  socket.write(buffer);
          }
else{
        const buffer=Buffer.from([0x01]);
        const bufferstring=buffer.toString('hex')
        //console.log("Written IMEI confirmation to IoT",buffer);
       setTimeout(()=>{
        socket.write(buffer);
        console.log("Written IMEI conf to IoT",buffer);
       },5000);

}

});
  socket.on("error", (err) => {
    console.error(`Socket error: ${err.message}`);
  });

  socket.on("end", () => {
          console.log(`Client disconnected from ${socket.remoteAddress}:${socket.remotePort}`);
  });
});
server.on("error", (err) => {
    console.error(`Server error: ${err.message}`);
          });
  server.on('unexpected-response', (request, response) => {
      console.error('Unexpected response:', response.statusCode);
  })
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
  }
  
  process.on("SIGINT", closeServer);