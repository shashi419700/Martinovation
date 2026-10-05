let clients = [];

export const addClient = (ws) => {
  clients.push(ws);
};

export const notifyClients = (data) => {
  clients.forEach((client) => {
    client.send(JSON.stringify(data));
  });
};