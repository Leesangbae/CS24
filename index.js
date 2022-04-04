const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const server = http.createServer(app);
const io = require("socket.io")(server);
const manager = require("./routes/manager.js");
const fs = require("fs");
const helmet = require("helmet");
const path = require("path");
const nocache = require("nocache");
const port = 4000;
const connection = require("./dbConfig");
const fileUpload = require("./routes/fileUpload");
const session = require("express-session");
const FileStore = require("session-file-store")(session);

server.listen(4000, () => {
  console.log("Server listening port", port);
});
function isEmptyArr(arr) {
  if (Array.isArray(arr) && arr.length === 0) {
    return true;
  }
  return false;
}
function isObjEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) return false;
  }

  return true;
}
let data = {};
var marcketInfo = [];
function dataReset() {
  data = {};
}

app.use(cors());
app.use(nocache());
app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// 정적 파일 설정 (미들웨어) 3
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
// ejs 설정 4
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Access-Control-Allow-Origin", "*");
  fs.readFile("./public/html/main.html", (err, data) => {
    if (err) throw err;
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    res.end();
  });
});

app.set("socketio", io);
io.on("connection", (socket) => {
  socket.on("setMarcket", (marcket) => {
    socket.nickname = marcket;
    let marcketdata = {};
    marcketdata[`${socket.id}`] = socket.nickname;
    if (isEmptyArr(marcketInfo)) {
      marcketInfo.push(marcketdata);
    }
    console.log(marcketInfo);
    if (
      marcketInfo.findIndex((item) =>
        Object.keys(item).find((key) => item[key] === socket.nickname)
      ) == -1
    ) {
      marcketInfo.push(marcketdata);
    }
  });
  socket.on("disconnect", () => {
    marcketInfo = marcketInfo.filter(
      (item) => item[`${socket.id}`] !== socket.nickname
    );
    dataReset();
    console.log(marcketInfo);
  });
  socket.on("sendList", (data) => {
    dataReset();
    let sendData = JSON.parse(data);
    let countData = {};
    let sumPrice = 0;
    let salesinfo = "";
    sendData.forEach((product) => {
      sumPrice = sumPrice + product.price;
      countData[product.productNumber] = [
        product.companyName,
        product.productName,
        product.price,
        product.productCount,
      ];
    });
    for (let reduceDate in countData) {
      const sql2 = `update registration_db set 갯수 = 갯수 - ${countData[reduceDate][3]} where company = '${countData[reduceDate][0]}' and product_name = '${countData[reduceDate][1]}' and price = ${countData[reduceDate][2]};`;
      connection.query(sql2, (error, rows) => {
        if (error) throw error;
        console.log(`상품 정보 쿼리 완료`);
      });
    }
    for (var salesdate in countData) {
      salesinfo =
        salesinfo + `${countData[salesdate][1]},${countData[salesdate][3]},`;
    }
    countData.allPrice = sumPrice;
    countData.dateInfo = new Date().toLocaleString();
    const sql1 = `INSERT INTO product_info(salesdate,salesprice,salesproduct) VALUES(now(),"${sumPrice}","${salesinfo}");`;
    if (isObjEmpty(sendData) == false) {
      connection.query(sql1, (error, rows) => {
        if (error) throw error;
        console.log("판매정보 쿼리 완료");
      });
    }
  });
});

app.post("/api/test", async (req, res) => {
  console.log(marcketInfo);
  var io = req.app.get("socketio");
  const { data1, data2, data3, data4, data5 } = req.body;
  function isEmptyArr(arr) {
    if (Array.isArray(arr) && arr.length === 0) {
      return true;
    }
    return false;
  }
  var ID = "";
  var marcketId = marcketInfo.find((item) =>
    Object.keys(item).find((key) => item[key] === data5)
  );
  if (isObjEmpty(marcketId) !== true) {
    ID = Object.keys(marcketId).toString();
  }
  const sql1 = `SELECT company, product_name, price, 갯수 FROM registration_db where manufacturer_code = ${data2} and product_code = ${data3} and '갯수' IN ('갯수' > 0);`;
  connection.query(sql1, (error, rows) => {
    if (error) throw error;
    if (!ID) {
      console.log("없는 매장입니다.");
    } else {
      if (isEmptyArr(rows) == true) {
        io.emit("emptyDB", "재고가 없는 물품입니다.");
      } else {
        if (isNaN(data[rows[0].product_name])) {
          data[rows[0].product_name] = 0;
        }
        data[rows[0].product_name] = data[rows[0].product_name] + 1;
        if (data[rows[0].product_name] <= rows[0]["갯수"]) {
          io.to(ID).emit("sendCode", rows);
        } else {
          console.log("더이상 재고가 없습니다.");
          data[rows[0].product_name] = data[rows[0].product_name] - 1;
          io.emit("emptyDB", "더이상 재고가 없습니다.");
        }
      }
    }
    console.log(data);
    res.send("ok");
  });
});

//프론트단에서
app.use("/upload", fileUpload);
app.use("/managerPage", manager);
