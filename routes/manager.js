const router = require("express").Router();
const connection = require("../dbConfig.js");
const session = require("express-session");
const FileStore = require("session-file-store")(session); // 세션을 파일에 저장
const cookieParser = require("cookie-parser");
const fs = require("fs");

router.use(
  session({
    secret: "project", // 데이터를 암호화 하기 위해 필요한 옵션
    resave: false, // 요청이 왔을때 세션을 수정하지 않더라도 다시 저장소에 저장되도록
    saveUninitialized: true, // 세션이 필요하면 세션을 실행시칸다(서버에 부담을 줄이기 위해)
    cookie: { maxAge: 3600000, httpOnly: true },
    store: new FileStore({ logFn: function () {} }), // 세션이 데이터를 저장하는 곳
  })
);

router.get("/", async (req, res) => {
  if (req.session.is_logined == true) {
    res.render("managerMain", {
      is_logined: req.session.is_logined,
      name: req.session.name,
    });
  } else {
    res.render("login", {
      is_logined: false,
    });
  }
});
router.post("/", (req, res) => {
  const body = req.body;
  const id = body.id;
  const pwd = body.pwd;
  function isEmptyArr(arr) {
    if (Array.isArray(arr) && arr.length === 0) {
      return true;
    }
    return false;
  }
  const sqlLogin = `select name, pwd, id from user_info where id="${id}" and pwd= "${pwd}"`;
  connection.query(sqlLogin, async (error, rows) => {
    if (error) throw error;
    if (isEmptyArr(rows) == true) {
      console.log("로그인 실패");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.write('<script>alert("아이디 및 비밀번호를 확인하세요.")</script>');
      res.write('<script>window.location="../managerPage"</script>');
      res.end();
    } else {
      console.log("로그인 성공");
      req.session.is_logined = true;
      req.session.name = rows[0].name;
      req.session.id = rows[0].id;
      req.session.pwd = rows[0].pwd;
      console.log(rows[0].name);
      req.session.save(function () {
        // 세션 스토어에 적용하는 작업
        res.render("managerMain", {
          // 정보전달
          name: rows[0].name,
          id: rows[0].id,
          phonenum: rows[0].phonenum,
          is_logined: true,
        });
      });
    }
  });
});
router.get("/inventory", (req, res) => {
  if (req.session.is_logined == true) {
    res.render("inventory", {
      is_logined: req.session.is_logined,
      name: req.session.name,
    });
  } else {
    res.render("login", {
      is_logined: false,
    });
  }
});
router.post("/inventory", (req, res) => {
  if (req.session.is_logined) {
    const sql6 = "select * from registration_db";
    connection.query(sql6, async (error, rows) => {
      if (error) throw error;
      res.send(rows);
    });
  } else {
    req.session.preUrl = req.originalUrl;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write('<script>alert("로그인 하십시오")</script>');
    res.write('<script>window.location="../managerPage"</script>');
    res.end();
  }
});
router.get("/money", (req, res) => {
  if (req.session.is_logined == true) {
    res.render("money", {
      is_logined: req.session.is_logined,
      name: req.session.name,
    });
  } else {
    res.render("login", {
      is_logined: false,
    });
  }
});
router.get("/money/mounth", (req, res) => {
  let selectMounth = "0" + req.query.data;
  var now = new Date(); // 현재 날짜 및 시간
  var year = now.getFullYear(); // 연도
  var selectYear = String(year);
  let mounthNumber = Number(req.query.data);
  let lastday = new Date(year, mounthNumber, 0).getDate();
  if (mounthNumber > 12 && mounthNumber < 0) {
    res.send("잘못된 달을 조회했습니다.");
  }
  if (mounthNumber == 9) {
    nextMounth = "10";
  } else if (mounthNumber >= 10) {
    selectMounth = req.query.data;
  }
  let sqlMounth = `select date_format(salesdate, '%m-%d')day, sum(salesprice) salesprice from product_info where date(salesdate) between '${selectYear}-${selectMounth}-01' and '${selectYear}-${selectMounth}-${lastday}' group by day;`;
  connection.query(sqlMounth, (error, rows) => {
    if (error) throw error;
    res.send(rows);
  });
});

router.get("/sales", async (req, res) => {
  if (req.session.is_logined == true) {
    res.render("sales", {
      is_logined: req.session.is_logined,
      name: req.session.name,
    });
  } else {
    res.render("login", {
      is_logined: false,
    });
  }
});

router.post("/sales", (req, res) => {
  if (req.session.is_logined) {
    const sql6 = `SELECT * FROM product_info;`;
    connection.query(sql6, async (error, rows) => {
      if (error) throw error;
      res.send(rows);
    });
  } else {
    req.session.preUrl = req.originalUrl;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write('<script>alert("로그인 하십시오")</script>');
    res.write('<script>window.location="../managerPage"</script>');
    res.end();
  }
});

router.get("/admin", (req, res) => {
  console.log("관리자페이지 작동");
  console.log(req.session);
});
// 회원가입
router.get("/register", (req, res) => {
  console.log("회원가입 페이지");
  res.render("register");
});
router.post("/register", (req, res) => {
  console.log("회원가입 하는중");
  const body = req.body;
  const id = body.id;
  const pwd = body.pwd;
  const pwd_con = body.pwd_con;
  const name = body.name;
  const phonenum = body.phonenum;

  connection.query("select * from user_info where id=?", [id], (err, data) => {
    if (data.length == 0 && pwd == pwd_con) {
      console.log("회원가입 성공");
      connection.query(
        "insert into user_info(name, phonenum, id, pwd) values(?,?,?,?)",
        [name, phonenum, id, pwd]
      );
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.write('<script>alert("회원가입 되었습니다.")</script>');
      res.write('<script>window.location="../managerPage/"</script>');
      res.end();
    } else {
      console.log("회원가입 실패");
      if (pwd != pwd_con) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.write('<script>alert("비밀번호가 일치하지 않습니다.")</script>');
        res.write('<script>window.location="../managerPage/register"</script>');
        res.end();
      } else {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.write('<script>alert("같은 아이디가 존재합니다.")</script>');
        res.write('<script>window.location="../managerPage/register"</script>');
        res.end();
      }
    }
  });
});
// 로그아웃
router.get("/logout", (req, res) => {
  console.log("로그아웃 성공");
  req.session.destroy(function (err) {
    res.clearCookie("sid");
    // 세션 파괴후 할 것들
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write('<script>alert("로그아웃 되었습니다.")</script>');
    res.write('<script>window.location="../managerPage"</script>');
    res.end();
  });
});
router.get("/manageProduct", async (req, res) => {
  if (req.session.is_logined) {
    const sql5 = `SELECT product_name, country, company, 상품설명, 상품분류 , 원가, price, 갯수 FROM registration_db;`;
    connection.query(sql5, async (error, rows) => {
      if (error) throw error;
      console.log(rows);
      res.send(rows);
    });
  } else {
    req.session.preUrl = req.originalUrl;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.write('<script>alert("로그인 하십시오")</script>');
    res.write('<script>window.location="../managerPage"</script>');
    res.end();
  }
});

router.post("/registration", async (req, res) => {
  const { data1, data2, data3, data4 } = req.body;
  let count;
  let saveData;
  let sql3;
  async function setSql(Data) {
    sql3 = `insert into registration_db(country_code, manufacturer_code, product_code, inspection_code, 제조국, 제조사 , 상품명, 상품설명, 원가 , 판매가 , 상품분류, 갯수)
    VALUE(${data1},${data2},${data3},${data4}, '${Data[0].country}','${Data[0].company}','${Data[0].product_name}','${Data[0]["상품설명"]}',${Data[0]["원가"]},${Data[0].price},'${Data[0]["상품분류"]}',1);`;
  }
  function isEmptyArr(arr) {
    if (Array.isArray(arr) && arr.length === 0) {
      return true;
    }
    return false;
  }
  const sql1 = `SELECT 갯수 FROM registration_db where country_code = ${data1} and manufacturer_code = ${data2} and product_code = ${data3};`;
  const sql2 = `SELECT country, company, product_name, 상품설명, 원가, price, 상품분류 FROM code_info where manufacturer_code = ${data2} and product_code = ${data3}`;
  connection.query(sql1, async (error, rows) => {
    if (error) throw error;
    count = await rows;
    if (isEmptyArr(count) === true) {
      connection.query(sql2, async (error, rows) => {
        if (error) throw error;
        saveData = await rows;
        await setSql(saveData);
        connection.query(sql3, (error, rows) => {
          if (error) throw error;
          console.log("재고 등록");
        });
      });
    } else {
      const sql4 = `update registration_db set 갯수 = 갯수 + 1 where country_code = ${data1} and manufacturer_code = ${data2} and product_code = ${data3} and inspection_code = ${data4};`;
      connection.query(sql4, (error, rows) => {
        if (error) throw error;
        console.log("재고 개수 증가");
      });
    }
  });
  res.send("성공적으로 쿼리했습니다.");
});

router.get("/cctv", async (req, res) => {
  if (req.session.is_logined == true) {
    res.render("cctv", {
      is_logined: req.session.is_logined,
      name: req.session.name,
    });
  } else {
    res.render("login", {
      is_logined: false,
    });
  }
});
router.post("/cctv", (req, res) => {
  const body = req.body;
  const id = body.id;
  const pwd = body.pwd;

  connection.query(
    "select count(*) cnt from user_info where id=? and pwd=?",
    [id, pwd],
    (err, data) => {
      var cnt = data[0].cnt;
      if (cnt == 1) {
        console.log("로그인 성공");
        // 세션에 추가
        req.session.is_logined = true;
        req.session.name = data.name;
        req.session.id = data.id;
        req.session.pwd = data.pwd;
        req.session.save(function () {
          // 세션 스토어에 적용하는 작업
          res.render("cctv", {
            // 정보전달
            name: data[0].name,
            id: data[0].id,
            phonenum: data[0].phonenum,
            is_logined: true,
          });
        });
      } else {
        console.log("로그인 실패");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.write('<script>alert("일치하는 정보가 없습니다.")</script>');
        res.write('<script>window.location="../managerPage"</script>');
        res.end();
      }
    }
  );
});

router.get("/cctv/images", async (req, res) => {
  const sql6 = `SELECT date,place,imagename FROM image_db;`;
  connection.query(sql6, async (error, rows) => {
    if (error) throw error;
    res.send(rows);
  });
});

module.exports = router;
