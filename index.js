import { google } from 'googleapis';

let server = new (require('ws')).Server({port: 443}),
    sockets = {},
    a = await readDB();

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
        if (isEmpty(sockets)) writeDB(a);
    });
});

const readDB = async () => {
    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.DB_KEY, range: process.env.RANGE});
    return Number(response.data.values[0][0]) || 0
}

const writeDB = async (value) => {
    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.update({ spreadsheetId: process.env.DB_KEY, range: process.env.RANGE, valueInputOption: 'RAW', resource: {values: [[value.toString()]]}});
}

const isEmpty = (variable) => {
    return (
      variable &&
      Object.keys(variable).length === 0 &&
      variable.constructor === Object
    );
};