var events = require('events'),
    util = require('util'),
    Connection = require('ssh2'),
    net = require('net')

//ssh -L 5984:localhost:5984 -p 443 vcadmin@216.24.163.8
function AuthSession(username, password, network) {

    this.username = username
    this.password = password
    this.sshhost = network['external_ip']
    this.internal_ip = network['internal_ip']

    this.sshconnection = null
    this.foward = null

    this.shutdown = function() {
        self.forward.shutdown()
        self.sshconnection.end()
    }

    this.authenticate = function() {


        self.sshconnection = new Connection()

        self.sshconnection.on('connect', function () {
            console.log('Connection :: connected')
        });
        self.sshconnection.on('error', function (err) {
            console.log('Connection :: error :: ' + JSON.stringify(err))
            self.emit('connection-error', { status:'Authentication Error' } )
        });
        self.sshconnection.on('end', function (err) {
            console.log('Connection :: end')
        });
        self.sshconnection.on('ready', function ( ) {
            console.log('Connection :: ready')
            self.forward = new LocalPortForwarder('couchdb-remote', 5984, 5984,self.internal_ip, self.sshconnection);

            self.forward.on('forward-ready', function() {
                self.emit('forward-ready')
            })
        })
        self.sshconnection.connect({
            host:self.sshhost,
            port:443,
            username:self.username,
            password:self.password,
            pingInterval:60001
        });
    }


    var self = this
}

function LocalPortForwarder (listenerName, listenerPort, forwardPort, forwardHost, sshconnection) {


    this.remotePortName = listenerName;
    this.remotePort = 'local-' + listenerPort;

    var localListener =  localListener = net.createServer( );
    localListener.listen(listenerPort, function (err) {

    });

    localListener.on('listening', function () {
        console.log(" LocalhostPortForwarder listening on " + listenerPort)
        self.emit('forward-ready')

        localListener.on('connection', function(sock) {
            sock.on('error', function (err) {
                console.log('SOCK ERROR::port forward - ' + listenerPort + " ->" + forwardHost + ":" + forwardPort + ' ::ERROR:: ' + err);
                sock.destroy();
                localListener.close();
                new LocalPortForwarder(listenerName, listenerPort, forwardPort, forwardHost, sshconnection);
            });

            sshconnection.forwardOut('0.0.0.0', forwardPort, forwardHost, forwardPort, function (err, stream) {
                if (err) {
                    console.log(err);
                }
                console.log('forward out for ' + forwardHost)
                try {
                    stream.on('error', function (err) {

                        sock.destroy();
                        stream.end();
                        console.log('STREAM ERROR::port forward - ' + listenerPort + " ->" + forwardHost + ":" + forwardPort + ' ::err:: ' + err);
                        localListener.end();
                    });


                    sock.pipe(stream);
                    stream.pipe(sock);
                } catch (err) {
                    console.log("forwardOut error - " + err);

                    self.emit('forward-error')
                }

            })
        })
    })


    this.reset = function ()
    {

    }
    localListener.on('end', function () {
        console.log('localListener end');
    });

    localListener.on('error', function(err ){
        console.log('localListener error:' + err);
    })

    this.shutdown = function () {
        try {
            localListener.close();
        } catch (err) {
        }
        console.log('LocalPortListener-' + listenerPort + ' ended.');
    }

    var self = this
    util.inherits(LocalPortForwarder, events.EventEmitter);
}
util.inherits(AuthSession, events.EventEmitter);


module.exports = {
    AuthSession:AuthSession
}