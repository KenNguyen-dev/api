var express = require('express');
var router = express.Router();
var db = require('../config/dbconfig')
var jwt = require('jsonwebtoken')
var multer  = require('multer')
path = require('path');
const DIR = './public/images';


getParameter=(req)=>{
    return parameters = [
        {name:'id',sqltype:'sql.NVarChar',value:req.body.id},
        {name:'ten',sqltype:'sql.NVarChar',value:req.body.ten},
        {name:'chu_thich_don_gian',sqltype:'sql.text',value:req.body.chu_thich_don_gian},
        {name:'chu_thich_day_du',sqltype:'sql.text',value:req.body.chu_thich_day_du},
        {name:'ngay_bat_dau',sqltype:'sql.date',value:req.body.ngay_bat_dau},
        {name:'ngay_ket_thuc',sqltype:'sql.date',value:req.body.ngay_ket_thuc},
        {name:'code_voucher',sqltype:'sql.NVarChar',value:req.body.code_voucher},
        {name:'gia_tri',sqltype:'sql.int',value:req.body.gia_tri},
        {name:'loai_voucher_id',sqltype:'sql.NVarChar',value:req.body.loai_voucher_id},
        {name:'so_luong',sqltype:'sql.int',value:req.body.so_luong},
        {name:'trang_thai',sqltype:'sql.NVarChar',value:req.body.trang_thai},
        {name:'hinh_anh',sqltype:'sql.NVarChar',value:req.body.hinh_anh},
        {name:'doi_tac_id',sqltype:'sql.NVarChar',value:req.body.doi_tac_id},
        {name:'diem_toi_thieu',sqltype:'sql.NVarChar',value:req.body.diem_toi_thieu}
        
    ]
}

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, DIR);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + file.originalname + path.extname(file.originalname));
    }
});
 
let upload = multer({storage: storage});

var authenticateJWT = (req) => {

    var checkAuth = false;

    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.SECRET.toString(), (err, user) => {
            if (err!=null) {
                console.log(err)
                // return res.sendStatus(403);
                //return false;
            }else{
               checkAuth=true;
            }    
        });
    } 
    return checkAuth
};

const executeQuery = function (res, query, parameters) {
    db.connect().then(()=>{
       
        parameters.forEach((p)=> {
            db.request().input(p.name, p.sqltype, p.value);
        });
        db.request().query(query, function (err, result) {
            if (err) {
                console.log(err);
                res.send('Failed');
            }
            else {
                if(result.rowsAffected==-1)
                {
                    res.send("Duplicate")
                    console.log('Row that are affected: '+result.rowsAffected+'Duplicate')
                }else if(result.rowsAffected==0)
                {
                    res.send("Failed")
                    console.log('Row that are affected: '+result.rowsAffected +'Failed')
                }else{
                    res.send("Success")
                    console.log('Row that are affected: '+result.rowsAffected +'Success')
                }          
            }
        }); 
    });
}



router.get('/list',(req,res,next)=>
{
    var checkAuthenticate = authenticateJWT(req)
    if(checkAuthenticate)
    {
        db.connect().then(() => {
            var queryString = `select * from voucher where doi_tac_id = '${req.body.id}'`
            db.request().query(queryString, (err, result) => {
            if(err) console.log(err)
                console.table(result.recordset)
                res.send(result.recordset)
            })
        })
    }
})

router.get('/cardlist',(req,res,next)=>
{
    db.connect().then(() => {
        var queryString = `select chu_thich_don_gian,ngay_ket_thuc,hinh_anh,id from [voucher]`
        db.request().query(queryString, (err, result) => {
        if(err) console.log(err)
            console.table(result.recordset)
            res.send(result.recordset)
        })
    })
    
})

router.post('/add',upload.single('hinh_anh'),(req,res,next)=>{

    var checkAuthenticate = authenticateJWT(req)
    if(checkAuthenticate)
    {
        var parameters = getParameter(req)
        
        if(!req.file)
        {
            res.status(400).send('No image file')
        }

        var file = req.file;
        var img_name = file.originalname;
        console.log(file)
        var data =JSON.parse(req.body.data)

        if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" )
        {
            var queryString = `IF NOT EXISTS 
                (   SELECT  1
                    FROM    [voucher] 
                    WHERE   code_voucher =	'${data.code_voucher}'
                )
                BEGIN
                        INSERT INTO [voucher] (id ,ten ,chu_thich_don_gian ,chu_thich_day_du ,ngay_bat_dau,
                                                ngay_ket_thuc ,code_voucher ,gia_tri ,loai_voucher_id, so_luong, 
                                                trang_thai ,hinh_anh , doi_tac_id, diem_toi_thieu) 
                        VALUES ('${data.doi_tac_id}-${data.code_voucher}',
                                '${data.ten}',
                                '${data.chu_thich_don_gian}',
                                '${data.chu_thich_day_du}',
                                '${data.ngay_bat_dau}',
                                '${data.ngay_ket_thuc}',
                                '${data.code_voucher}',
                                '${data.gia_tri}',
                                '${data.loai_voucher_id}',
                                '${data.so_luong}',
                                '${data.trang_thai}',
                                'http://localhost:9000/images/${file.filename}',
                                '${data.doi_tac_id}',
                                '${data.diem_toi_thieu}')
                END;`
                executeQuery(res,queryString,parameters); 
        }else{
        res.send("Failed")
        }
    }else{
        res.send("Failed")
    }
})

router.get('/details',(req,res,next)=>
{
    var checkAuthenticate = authenticateJWT(req)
    if(checkAuthenticate)
    {
        var parameters = getParameter(req)
        var queryString = `select * from voucher where id='${req.body.id}'`;
        executeQuery(res,queryString,parameters);
    }else{
        res.send("Failed")
    }
})


router.delete('/delete',(req,res,next)=>
{
    var checkAuthenticate = authenticateJWT(req)
    if(checkAuthenticate)
    {
        var parameters = getParameter(req)
        console.log('This is request body: '+req.body.id)
        var queryString = `DELETE FROM [voucher] where id='${req.body.id}'`
        executeQuery(res,queryString,parameters);
    }else{
        res.send("Failed")
    }
})

router.put('/update',(req,res,next)=>
{

    var checkAuthenticate = authenticateJWT(req)
    if(checkAuthenticate)
    {
        var parameters = getParameter(req)
    
        var queryString = `IF NOT EXISTS 
                                (   SELECT  1
                                    FROM    [voucher] 
                                    WHERE   code_voucher =	'${req.body.code_voucher}'
                                )
                                BEGIN
                                    UPDATE [voucher] SET
                                        id='${req.body.doi_tac_id}-${req.body.code_voucher}',
                                        ten='${req.body.ten}',
                                        chu_thich_don_gian='${req.body.chu_thich_don_gian}',
                                        chu_thich_day_du=${req.body.chu_thich_day_du},
                                        ngay_bat_dau=${req.body.ngay_bat_dau},
                                        ngay_ket_thuc=${req.body.ngay_ket_thuc},
                                        code_voucher=${req.body.code_voucher},
                                        gia_tri=${req.body.gia_tri},
                                        loai_voucher_id=${req.body.loai_voucher_id},
                                        so_luong=${req.body.so_luong},
                                        trang_thai=${req.body.trang_thai},
                                        hinh_anh=${req.body.hinh_anh},
                                        diem_toi_thieu=${req.body.diem_toi_thieu}                                         
                                    WHERE id='${req.body.id}'
                                END`
        executeQuery(res,queryString,parameters);

    }else{
        res.send("Failed")
    }

   
})

module.exports=router;