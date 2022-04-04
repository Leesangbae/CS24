const router = require("express").Router();
const path = require("path");
const multer = require("multer");
const connection = require("../dbConfig.js");
const upload = multer({
  storage: multer.diskStorage({
    // 저장한공간 정보 : 하드디스크에 저장
    destination(req, file, done) {
      // 저장 위치
      done(null, "uploads/"); // uploads라는 폴더 안에 저장
    },
    filename(req, file, done) {
      // 파일명을 어떤 이름으로 올릴지
      const ext = path.extname(file.originalname); // 파일의 확장자
      done(null, path.basename(file.originalname, ext) + Date.now() + ext); // 파일이름 + 날짜 + 확장자 이름으로 저장
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 5메가로 용량 제한
});

router.post("/single", upload.single("test_image"), (req, res) => {
  const sql1 = `INSERT INTO image_db(date, place, imagename) VALUES(now(),"${req.file.path}","${req.file.filename}");`;
  connection.query(sql1, async (error, rows) => {
    if (error) throw error;
  });
  res.send("사진전송 완료");
});

module.exports = router;
