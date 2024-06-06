const net = require('net');

// Define the address and port of the server
const serverAddress = 'localhost'; // Change this to your server's IP address
const serverPort = 1234; // Change this to your server's port

// Function to generate random data
function generateRandomData() {
    return Math.random().toString(36).substring(2, 10); // Generate random string
}

// IMEI code to send to the server
const imeiCode = "000f383633353430303632343536393335"; // Replace this with your actual IMEI code
const heartbeatdata="00000000000000628e010000018f5cf0bd00002dfea68b1100b28f000000000000000000000e000500ef0100f00100150500c800004502000600b5000000b60000004262600018000000430ffd00440000000300f100009dda00c70000000000100249ea9a0000000001000073a";

// Connect to the server
function connectToServer() {
    const client = net.createConnection({ host: serverAddress, port: serverPort }, () => {
        console.log('Connected to the server');
        let acknowledgement='01';
        // Send IMEI code to the server
        console.log('Sending IMEI code to server:', imeiCode);
        client.write(imeiCode);

        // Handle data received from the server
        client.on('data', (data) => {
            const response = data.toString('hex');
            console.log('Received response from server:', response);
            if (response === acknowledgement) {
                // Acknowledgement received, start sending random data
               acknowledgement="000000"+heartbeatdata.substring(18,20);
                setTimeout(()=>{
                    console.log("Sending Heartbeat data to server");
                    client.write(heartbeatdata);
                },2000);
                const acknowledgementTimeout = setTimeout(() => {
                    console.log('No response from server, disconnecting');
                    client.end();
                }, 60000);
                client.on('data', () => {
                    clearTimeout(acknowledgementTimeout);
                });
                // Handle server disconnect
                client.on('end', () => {
                                       console.log('Server closed the connection');
                });
            } else {
                // No acknowledgement or invalid response, disconnect from server
                console.log('No acknowledgement or invalid response received, disconnecting from server');
                client.end();
            }
        });

        // Set timeout for acknowledgement
        const acknowledgementTimeout = setTimeout(() => {
            console.log('No response from server, disconnecting');
            client.end();
        }, 60000);

        // Clear timeout if acknowledgement received
        client.on('data', () => {
            clearTimeout(acknowledgementTimeout);
        });
    });

    // Handle errors
    client.on('error', (error) => {
        console.error('Error:', error);
    });

    // Handle server close
    client.on('close', () => {
        console.log('Connection to server closed');
        // Reconnect to server
        setTimeout(connectToServer, 1000);
    });
}

// Start the connection process
connectToServer();
