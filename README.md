# node-antminer
NodeJS module to read out Antminer status

## Installing
You can install the module using NPM:

```shell
$ npm install --save node-antminer
```

## Usage
First, include the package in the file you would like to use it:

```js
var antminer = require('node-antminer');
```

Then, you can request the status of an antminer using the following statement:

```js
antminer.readStats(host, port, username, password, callback);
```

The following parameters should be passed in:

* [host] : The host name or IP Address of the antminer
* [port] : The port number where the web server is running (usually 80)
* [username] : The user name of the antminer web interface (default: root)
* [password] : The password of the antminer web interface (default: root)
* [callback] : A callback function to receive the statistics. First parameter is error (null if no error occurred), second is a structure with the statistics.

## Example
```js
var antminer = require('node-antminer');
antminer.readStats("192.168.0.2",80,"root","root",(err, stats) => {
    if(err) {
        console.error("An error occurred fetching stats from antminer", err);
    } else {
        console.log("Statistics read:", stats);
    }
});
```