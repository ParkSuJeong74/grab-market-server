const express = require("express");
const cors = require("cors");
const app = express();
const port = 8080;
const models = require("./models");
const multer = require("multer");
const { diskStorage } = require("multer");

const upload = multer({
    storage: multer.diskStorage({
        destination : function(req, file, cb){
            cb(null, "uploads/")
        }, filename: function(req, file, cb){
            cb(null, file.originalname)
        }
    })
})

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/products", (req, res) => {
    models.Product.findAll({
        limit: 50,
        order: [["createdAt", "DESC"]],
        attributes : [
            'id',
            'name',
            'price',
            'seller',
            'createdAt',
            'imageUrl',
        ]
    })
    .then((result) => {
        console.log("조회 완료 : ", result);
        res.send({
            products : result,
        })
    }).catch((error) => {
        console.error(error);
        res.send("조회에 문제가 발생했습니다.");
    })
    
});
app.post("/products", (req, res) => {
    const body = req.body;
    const {name, price, seller, description} = body;

    if(!name || !price || !seller || !description){
        res.send("모든 필드를 입력해주세요.")
        return;
    }

    models.Product.create({
        name,
        price, 
        seller,
        description
    })
    .then((result) => {
        console.log("업로드 완료 : ", result);
        res.send({
            result,
        });
    })
    .catch((error) => {
        console.error(error);
        res.send("업로드에 문제가 발생했습니다.");
    })
});
app.get("/products/:id", (req, res) => {
    const params = req.params;
    const {id} = params;

    models.Product.findOne({
        where : {
            id : id
        }
    })
    .then((result) => {
        console.log("상세 페이지 조회 완료 : ", result);
        res.send({
            product : result
        });
    })
    .catch((error) => {
        console.error(error);
        res.send("상세 페이지 조회에 문제가 발생했습니다.");
    })
})

app.post("/image", upload.single("image"), (req, res) => {
    const file = req.file;
    console.log(file);
    res.send({
        imageUrl : file.path
    })
})

app.listen(port, () => {
    console.log("그랩 쇼핑몰 서버가 돌아가고 있습니다.");
    models.sequelize
    .sync()
    .then(() => {
        console.log("DB 연결");
    }).catch((error) => {
        console.error(error);
        process.exit();
    })
});
