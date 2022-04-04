const connection = require("../dbConfig");

const testCtrl = {
  gettests: async (req, res) => {
    connection.query("SELECT * FROM product_info", (error, rows) => {
      if (error) throw error;
      res.send(rows);
    });
  },
  inserttest: async (req, res) => {
    //javascript 구조분해할당
    const { data1, data2, data3, data4 } = req.body;
    const sql = `INSERT INTO product_info(cic,mc,pic,cd)
        VALUES(${data1},${data2},${data3},${data4});`;

    connection.query(sql, (error, rows) => {
      if (error) throw error;
      res.send(rows);
    });
  },
  checktest: async (req, res) => {
    const { data1, data2, data3, data4 } = req.body;
    const sql = `SELECT company_name, Product_name, price FROM code_info where company = ${data2} and product = ${data3}`;
    connection.query(sql, (error, rows) => {
      if (error) throw error;
      res.send(rows);
    });
  },
};

module.exports = testCtrl;
