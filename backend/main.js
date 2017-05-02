#!/usr/bin/env node

var express = require('express')
var http    = require('http')
var debug   = require('debug')('witpay-chat:server')

var env     = process.env.NODE_ENV || 'development'
var app     = express()
var port    = createPortNumber(process.env.PORT || '4000')

app.set('port', port)

var server = http.createServer(app)
var serverForSocket = server.listen(port)

require('./config/socketio')(app, server)

server.on('error', onError)
server.on('listening', onListening)

function createPortNumber(val) {
  var port = parseInt(val, 10)
  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  var bind = (typeof port === 'string')
                    ? 'Pipe ' + port
                    : 'Port ' + port
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
}


function onListening() {
  var addr = server.address()
  var bind = (typeof addr === 'string')
                    ? 'pipe ' + addr
                    : 'port ' + addr.port
  debug('Listening on ' + bind)
}


exports = module.exports = app