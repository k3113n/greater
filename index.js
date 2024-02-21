//require('dotenv').config();
const {google} = require('googleapis');
const {GoogleAuth} = require("google-auth-library");

const sheets = google.sheets('v4');

const readDB = async () => {
    try{
        const response = await sheets.spreadsheets.values.get({ 
            auth: new GoogleAuth({
                keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'] }),
            spreadsheetId: process.env.DB_KEY, 
            range: process.env.COUNT
        });
        return Number(await response.data.values[0][0]);
    } catch(err) {
        console.log("Error: " + err);
        return 0;
    }
}

const writeDB = async (value) => {
    try{
        const response = await sheets.spreadsheets.values.update({ 
            auth: new GoogleAuth({
                keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'] }),
            spreadsheetId: process.env.DB_KEY, 
            range: process.env.COUNT,
            valueInputOption: 'RAW', 
            resource: {values: [[value]]}
        });
    } catch(err) {
        console.log("Error: " + err);
    }
}

const logDB = async (value) => {
    try{
        const response = await sheets.spreadsheets.values.append({ 
            auth: new GoogleAuth({
                keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'] }),
            spreadsheetId: process.env.DB_KEY, 
            range: process.env.LOG,
            valueInputOption: 'RAW', 
            resource: {values: [[new Date(), value]]}
        });
    } catch(err) {
        console.log("Error: "+error);
    }
}

readDB().then((a) => {
    let server = new (require('ws')).Server({port: 443}),
    sockets = {};    
    server.on('connection', function (socket, req) {
        let user = crypto.randomUUID();
        sockets[user] = socket;
        socket.send(a);

        let client = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        logDB(client);

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
});
