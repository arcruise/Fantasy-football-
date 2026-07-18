const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });
let rooms = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        let data = JSON.parse(message);
        if(data.type === 'host'){
            let code = Math.floor(1000 + Math.random() * 9000);
            rooms[code] = [ws]; ws.room = code; ws.player = 1;
            ws.send(JSON.stringify({type: 'hosted', code: code}));
        }
        if(data.type === 'join'){
            let code = data.code;
            if(rooms[code] && rooms[code].length === 1){
                rooms[code].push(ws); ws.room = code; ws.player = 2;
                rooms[code].forEach(p => p.send(JSON.stringify({type: 'start'})));
            } else {
                ws.send(JSON.stringify({type: 'error', msg: 'Room not found'}));
            }
        }
        if(data.type === 'update'){
            if(rooms[ws.room]) rooms[ws.room].forEach(p => { if(p!== ws) p.send(JSON.stringify(data)); })
        }
    });
    ws.on('close', () => { if(ws.room && rooms[ws.room]){ rooms[ws.room] = rooms[ws.room].filter(p => p!== ws); if(rooms[ws.room].length === 0) delete rooms[ws.room]; } });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on', PORT));
