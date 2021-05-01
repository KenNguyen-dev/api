var express = require('express');
var router = express.Router();
var db = require('../config/dbconfig')
var jwt = require('jsonwebtoken')


getParameter=(req)=>{
    return parameters = [
        {name:'id',sqltype:'sql.NVarChar',value:req.body.id},
        {name:'ten_doanh_nghiep',sqltype:'sql.NVarChar',value:req.body.ten_doanh_nghiep},
        {name:'ten_viet_tat',sqltype:'sql.NVarChar',value:req.body.ten_viet_tat},
        {name:'sdt',sqltype:'sql.NVarChar',value:req.body.sdt},
        {name:'email',sqltype:'sql.NVarChar',value:req.body.email},
        {name:'loai_doi_tac_id',sqltype:'sql.NVarChar',value:req.body.loai_doi_tac_id},
        {name:'nguoi_dai_dien',sqltype:'sql.NVarChar',value:req.body.nguoi_dai_dien},
        {name:'mat_khau',sqltype:'sql.NVarChar',value:req.body.mat_khau}
    ]
}

getParameterLogin=(req)=>{
    return parameters = [  
        {name:'email',sqltype:'sql.NVarChar',value:req.body.email},  
        {name:'mat_khau',sqltype:'sql.NVarChar',value:req.body.mat_khau}
    ]
}

var authenticateJWT = (req, res, next) => {

    var checkAuth = false;

    const authHeader = req.headers.authorization;
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
    db.connect().then(() => {
        var queryString = 'select * from doi_tac';
        db.request().query(queryString, (err, result) => {
          if(err) console.log(err)
            console.table(result.recordset)
            res.send(result.recordset)
        })
    })
})



router.post('/register',(req,res,next)=>{

    var parameters = getParameter(req)
    var queryString = `IF NOT EXISTS 
                            (   SELECT  1
                                FROM    [doi_tac] 
                                WHERE   email =	'${req.body.email}'
                            )
                            BEGIN
                                    INSERT INTO [doi_tac] (id,ten_doanh_nghiep,ten_viet_tat,sdt,email,loai_doi_tac_id,nguoi_dai_dien,mat_khau) 
                                    VALUES ('${req.body.loai_doi_tac_id}-${req.body.ten_viet_tat}',
                                            '${req.body.ten_doanh_nghiep}',
                                            '${req.body.ten_viet_tat}',
                                            '${req.body.sdt}',
                                            '${req.body.email}',
                                            '${req.body.loai_doi_tac_id}',
                                            '${req.body.nguoi_dai_dien}',
                                            '${req.body.mat_khau}')
                            END;`
    executeQuery(res,queryString,parameters);
})

router.post('/login',(req,res,next)=>{
    
    var parameters = getParameterLogin(req);

    var query = `Select id from [doi_tac] where email = '${req.body.email}' and mat_khau='${req.body.mat_khau}'`;

    db.connect().then(()=>{ 
        parameters.forEach((p)=> {
            db.request().input(p.name, p.sqltype, p.value);
        })
        db.request().query(query, function (err, result) {
            if (err) {
                console.log(err);
                res.send('Server Failed');
            }
            else {
                if(result.recordset[0]!=null)
                {
                    console.log(process.env.SECRET.toString())
                    const accessToken = jwt.sign({ email: req.body.email }, process.env.SECRET.toString(),{"expiresIn":'20m'});
                    res.json({
                        "Token":accessToken,
                        "id":result.recordset[0].id
                    });
                    
                }else{
                    res.send('Failed')
                }
            }
        }); 
    });
    
})

router.post('/logout',(req,res,next)=>
{
    var checkAuthenticate = authenticateJWT(req)
    if(checkAuthenticate)
    {
        res.json({
            "Token":"",
            "id":""
        })
    }
})  



router.get('/details',(req,res,next)=>
{
    // db.connect().then(() => {
    //     var queryString = `select * from loai_voucher where id='${req.body.id}'`;
    //     console.log(queryString)
    //     db.request().query(queryString, (err, result) => {
    //       if(err) console.log(err)
    //         console.table(result.recordset[0])
    //         res.send(result.recordset[0])
    //     })
    // })

    var parameters = getParameter(req)
    var queryString = `select * from [doi_tac] where id='${req.body.id}'`;
    executeQuery(res,queryString,parameters);
})


router.delete('/delete',(req,res,next)=>
{
    // db.connect().then(() => {
    //     var queryString = `DELETE FROM [loai_voucher] where id='${req.body.id}'`
    //     db.request().query(queryString, (err) => {
    //       if(err) console.log(err)
    //         res.send("Delete success")
    //     })
    // })
    var parameters = getParameter(req)
    console.log('This is request body: '+req.body.id)
    var queryString = `DELETE FROM [doi_tac] where id='${req.body.id}'`
    executeQuery(res,queryString,parameters);
})

router.put('/update',(req,res,next)=>
{
    var parameters = getParameter(req)
    
    var queryString = `IF NOT EXISTS 
                            (   SELECT  1
                                FROM    [doi_tac] 
                                WHERE   email =	'${req.body.email}'
                            )
                            BEGIN
                                UPDATE [doi_tac] SET 
                                    id='${req.body.loai_doi_tac_id}+${req.body.ten_viet_tat}',
                                    ten_doanh_nghiep='${req.body.ten_doanh_nghiep}',
                                    ten_viet_tat=${req.body.ten_viet_tat},
                                    sdt=${req.body.sdt}
                                    email=${req.body.email}
                                    loai_doi_tac_id=${req.body.loai_doi_tac_id},
                                    nguoi_dai_dien=${req.body.nguoi_dai_dien},
                                    mat_khau=${req.body.mat_khau}                                           
                                WHERE id='${req.body.id}'
                            END`
    executeQuery(res,queryString,parameters);
})

module.exports=router;