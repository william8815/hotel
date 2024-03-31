const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// step1 : 連線 對應資料庫
// 遠端資料庫
let uri = process.env.DATABASE;
uri = uri.replace("<username>", process.env.DATABASE_USERNAME);
uri = uri.replace("<password>", process.env.DATABASE_PASSWORD);
uri = uri.replace("<model>", process.env.DATABASE_MODEL);

mongoose
  .connect(uri)
  .then(() => {
    console.log("連線成功");
  })
  .catch((error) => {
    console.log("連線失敗", error);
  });
// step2 : 定義 schema 建立 model
const Room = require("./models/room");
// step3 : 實作 CRUD 功能
let server = http.createServer(async (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };
  // 取得所有資料
  if (req.url == "/rooms" && req.method == "GET") {
    const rooms = await Room.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        rooms,
      })
    );
    res.end();
  }
  // 新增資料
  // req.body 資料
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  if (req.url == "/rooms" && req.method == "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const newRoom = await Room.create({
          name: data.name,
          price: data.price,
          rating: data.rating,
        });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: "success",
            rooms: newRoom,
          })
        );
        res.end();
      } catch (error) {
        console.log(error);
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: "false",
            message: "欄位沒有正確，或沒有此 ID",
            error: error,
          })
        );
        res.end();
      }
    });
  }
  // 刪除全部資料
  if (req.url == "/rooms" && req.method == "DELETE") {
    const rooms = await Room.deleteMany({});
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        rooms: [],
      })
    );
    res.end();
  }
  // 刪除單筆資料
  if (req.url.startsWith("/rooms/") && req.method == "DELETE") {
    try {
      let id = req.url.split("/").pop(); // 抓取 id
      const rooms = await Room.findByIdAndDelete(id);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: "success",
          rooms: [],
        })
      );
      res.end();
    } catch (error) {
      res.writeHead(400, headers);
      res.write(
        JSON.stringify({
          status: "false",
          message: "欄位沒有正確，或沒有此 ID",
          error: error,
        })
      );
      res.end();
    }
  }
  // 更新單筆資料
  if (req.url.startsWith("/rooms/") && req.method == "PATCH") {
    try {
      req.on("end", async () => {
        let id = req.url.split("/").pop(); // 抓取 id
        const data = JSON.parse(body);
        const rooms = await Room.findByIdAndUpdate(id, {
          ...data,
          name: data.name,
        });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: "success",
            rooms: rooms,
          })
        );
        res.end();
      });
    } catch (error) {
      res.writeHead(400, headers);
      res.write(
        JSON.stringify({
          status: "false",
          message: "欄位沒有正確，或沒有此 ID",
          error: error,
        })
      );
      res.end();
    }
  }

  // if (req.method == "OPTIONS") {
  //   // 因為 preflight api 檢查機制，所以需特別設定
  //   // preflight 主要針對請求不同網域的 api，會先以 OPTIONS 請求進行檢查，許可同意後才會 執行原本的方法進行請求
  //   res.writeHead(200, headers);
  //   res.end();
  // } else {
  //   res.writeHead(404, {
  //     "Content-Type": "text/plain",
  //   });
  //   res.write(
  //     JSON.stringify({
  //       status: "false",
  //       message: "404 not found page!!!",
  //     })
  //   );
  //   res.end();
  // }
});

server.listen(process.env.PORT);
