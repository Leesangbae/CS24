const router = require("express").Router();
const connection = require("../dbConfig");
let data = {};
function dataReset() {
  data = {};
}
router.post("/", async (req, res) => {
  var io = req.app.get("socketio");
  const { data1, data2, data3, data4 } = req.body;
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
  const sql1 = `SELECT company, product_name, price, 갯수 FROM registration_db where manufacturer_code = ${data2} and product_code = ${data3} and '갯수' IN ('갯수' > 0);`;
  connection.query(sql1, (error, rows) => {
    if (error) throw error;
    if (isEmptyArr(rows) == true) {
      io.emit("emptyDB", "재고가 없는 물품입니다.");
    } else {
      if (isNaN(data[rows[0].product_name])) {
        data[rows[0].product_name] = 0;
      }
      data[rows[0].product_name] = data[rows[0].product_name] + 1;
      if (data[rows[0].product_name] <= rows[0]["갯수"]) {
        io.emit("sendCode", rows);
      } else {
        console.log("더이상 재고가 없습니다.");
        data[rows[0].product_name] = data[rows[0].product_name] - 1;
        io.emit("emptyDB", "더이상 재고가 없습니다.");
      }
    }
    console.log(data);
    res.send("ok");
  });
});

module.exports = { router, dataReset };
