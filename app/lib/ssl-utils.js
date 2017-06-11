var https = require('https');
var tunnel = require('./tunnel');
var ndi = require('./ndi-api');

var tunnels = [];

var authenticate = function (authHost, username, password) {
    var credentials = username + ':' + password;
    var encoded = new Buffer(String(credentials)).toString('base64');
    var opts = {
        host:authHost,
        path:'/auth',
        headers:{'Authorization':'Basic ' + encoded}
    };
    var req = https.request(opts, function (res) {
        ndi.ndilog('done');
    });
    req.on('error', function (err) {
        ndi.ndilog('Unable to authenticate - ' + username + ':' + password + '@' + rauthHost);

    });
    req.end();
}

var closeTunnel = function (id) {
    tunnels[id].close();
}

var createLocalForward = function (remoteHost, username, password, srcHost, srcPort, dstHost, dstPort) {

    var srcHostPort = srcHost + ":" + srcPort;
    var dstHostPort = dstHost + ":" + dstPort;
    var credentials = username + ':' + password;

    tunnel.createTunnel(remoteHost, credentials, srcHostPort, dstHostPort, function (err, server) {
        if (err) {
            ndi.ndilog(String(err));
        } else {
            var id = tunnels.push(server);
            ndi.ndilog('Tunnel ' + srcHostPort + ' to ' + dstHostPort + ' created with id: ' + id);
        }

    });
}

var createSSHConnection = function (sshHost, sshPort, sshUsername, sshPassword,  callback) {
    var Connection = require('ssh2');
    var activeHost = sshHost;
    var c = new Connection();

    console.log("createSSHConnection:" + sshUsername + "/" + sshPassword + "@" + sshHost + "/" + sshPort);
    c.connect({
        host:activeHost,
        port:sshPort,
        username:sshUsername,
        password:sshPassword,
        pingInterval:60001
    });


    c.on('ready', function () {
        console.log('Connection :: ready');


        c._openChan('session', function (err, chan) {
            console.log('ssh connection channel open');
            callback(c,activeHost);
            if (err)
                return cb(err);
            if (typeof env === 'object')
                chan._sendEnv(env);
        });
    });

    c.on('error', function (err) {
        ndi.ndilog('createSSHConnection :: error :: ' + err);
    });




}

var createSSHConnectionForward = function (connection, srcIP, srcPort, dstIP, dstPort, callback) {


    console.log("createSSHConnectionForward : " + srcIP + ":" + srcPort + " to " + dstIP + ":" + dstPort );

    connection.forwardOut(srcIP, srcPort, dstIP, dstPort, function (err, stream) {
        if (err) {
            console.log('createSSHConnectionFoward Error: ' + err);
            connection.end();
        }
        else {
            console.log('ForwardOut :: setup ' + srcIP + ':' + srcPort + ' to ' + dstIP + ':' + dstPort);
            callback(stream);
        }

    });
}

var createSSHConnectionReverseForward = function (connection, remote_port, callback) {



    connection.forwardIn('127.0.0.1',  remote_port, function (err) {
        if (err) {
            callback(err);

        }
        else {
            callback();

        }
    });
}

var sshAuthenticate = function (sshHost, sshPort, sshUsername, sshPassword) {
    var Connection = require('ssh2');

    var c = new Connection();
    c.on('connect', function () {
        console.log('Connection :: connected');
        c.end();
    });
    c.on('error', function (err) {
        console.log('Connection :: error :: ' + err);
    });
    c.on('end', function (err) {
        console.log('Connection :: end');
    });
    c.connect({
        host:sshHost,
        port:sshPort,
        username:sshUsername,
        password:sshPassword,
        pingInterval:60001
    });


}
module.exports = {
    createLocalForward:createLocalForward,
    closeTunnel:closeTunnel,
    authenticate:authenticate,
    createSSHConnectionForward:createSSHConnectionForward,
    createSSHConnectionReverseForward:createSSHConnectionReverseForward,
    createSSHConnection:createSSHConnection,
    sshAuthenticate:sshAuthenticate

}
