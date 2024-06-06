
This guide will walk you through the process of setting up RabbitMQ with Node.js.

## Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine
- [Homebrew](https://brew.sh/) (for macOS users)

## Installation

### 1. Install amqplib
```
npm install amqplib
```
### 2. Install RabbitMQ
```
brew install rabbitmq
```
Usage
## 1.Finding the RabbitMQ Server Location
To find the location of the RabbitMQ server, run:
```
brew info rabbitmq
```
You'll find a path similar to 
```
/opt/homebrew/opt/rabbitmq/sbin/rabbitmq-server.
```
 Copy this path as you'll need it to start the RabbitMQ server.

## 2.Starting the RabbitMQ Server
Paste the copied path in the terminal and execute it to start the RabbitMQ server.

## 3.Starting the Node.js Server
After starting the RabbitMQ server, run your **server.js** to start using RabbitMQ in your application.
