const mongoose = require("mongoose");
const roomSchma = new mongoose.Schema(
  {
    name: String,
    price: {
      type: Number,
      required: [true, "價格必填"],
    },
    // 自訂義 創建時間
    createdAt: {
      type: Date,
      default: Date.now, // 預設值
      select: false,
    },
  },
  {
    // config
    versionKey: false,
    // collection: "room"
    // timestamps: true, // 預設是會新增 createAt、updateAt 時間資料
  }
);
const Room = mongoose.model("Room", roomSchma);
module.exports = Room;
