const SocketIo = require("socket.io");

module.exports = (server) => {
  const io = SocketIo(server, { path: "/socket.io" });

  io.on("connection", (socket) => {
    socket.on("sendList", (data) => {
      let sendData = JSON.parse(data);
      let countData = {};
      let sumPrice = 0;
      sendData.forEach((product) => {
        sumPrice = sumPrice + product.price;
        countData[product.productNumber] = [
          product.companyName,
          product.productName,
          product.price,
          product.productCount,
        ];
      });
      countData.allPrice = sumPrice;
      countData.dateInfo = new Date().toLocaleString();
      console.log(countData);
    });
  });
};
