let server = new (require('ws')).Server({port: 443}),
    sockets = {},
    a = 0;

server.on('connection', function (socket) {
    let user = crypto.randomUUID();
    sockets[user] = socket;
    socket.send(a);

    socket.on('message', function (message) {
        let b = Number(message);
        if(!isNaN(b)) {
            if(a < b){
                a = b;      
                for(const [i, s] of Object.entries(sockets)) {
                    if(i != user) s.send(a.toString());
                }
            } 
            if(a > b) {
                socket.send(a.toString());
            }
        }
    });

    socket.on('close', function () {
        delete sockets[user];
    });
});
