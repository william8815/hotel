const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// step1 : 連線 對應資料庫
// 遠端資料庫
let uri = process.env.DATABASE;
uri = uri.replace("<password>", process.env.DATABASE_PASSWORD);

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
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
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
  } else if (req.url == "/rooms" && req.method == "POST") {
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
  } else if (req.url == "/rooms" && req.method == "DELETE") {
    const rooms = await Room.deleteMany({});
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        rooms: [],
      })
    );
    res.end();
  } else if (req.url.startsWith("/rooms/") && req.method == "DELETE") {
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
  } else if (req.url.startsWith("/rooms/") && req.method == "PATCH") {
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
  } else if (req.method == "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, {
      "Content-Type": "text/plain",
    });
    res.write(
      JSON.stringify({
        status: "false",
        message: "404 not found page!!!",
      })
    );
    res.end();
  }
});

server.listen(process.env.PORT);
