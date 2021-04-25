var express = require('express');
var router = express.Router();
var db = require('../config/dbconfig')


getParameter=(req)=>{
    return parameters = [
        {name:'id',sqltype:'sql.NVarChar',value:req.body.id},
        {name:'ten_doanh_nghiep',sqltype:'sql.NVarChar',value:req.body.ten_doanh_nghiep},
        {name:'sdt',sqltype:'sql.NVarChar',value:req.body.sdt},
        {name:'email',sqltype:'sql.NVarChar',value:req.body.email},
        {name:'loai_doi_tac_id',sqltype:'sql.NVarChar',value:req.body.loai_doi_tac_id},
        {name:'nguoi_dai_dien',sqltype:'sql.NVarChar',value:req.body.nguoi_dai_dien},
        {name:'mat_khau',sqltype:'sql.NVarChar',value:req.body.mat_khau}
    ]
}

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
                console.log(result.rowsAffected)
                if(result.rowsAffected!=0){
                    console.log('Row that are affected: '+result.rowsAffected)
                    res.send("Success");
                }else{
                    console.log('Row that are affected: '+result.rowsAffected)
                    res.send("Failed")
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



router.post('/add',(req,res,next)=>{

    // db.connect().then(() => {
    //     var queryString = `INSERT INTO [loai_voucher] (id,ten) VALUES ('${req.body.id}','${req.body.ten}')`;
    //     db.request().query(queryString, (err) => {
    //       if(err) {
    //         console.log(err)
    //         res.send('Add failed. Please check your ID again')
    //       }else{
    //         res.send('Add Successfully')
    //       }       
    //     })
    // })

    var parameters = getParameter(req)
    var queryString = `INSERT INTO [doi_tac] (id,ten_doanh_nghiep,ten_viet_tat,sdt,email,loai_doi_tac_id,nguoi_dai_dien,mat_khau) 
                        VALUES ('${req.body.loai_doi_tac_id}-${req.body.ten_viet_tat}','${req.body.ten_doanh_nghiep}','${req.body.ten_viet_tat}','${req.body.sdt}','${req.body.email}','${req.body.loai_doi_tac_id}','${req.body.nguoi_dai_dien}','${req.body.mat_khau}')`;
    console.log(queryString)
    executeQuery(res,queryString,parameters);
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
    var queryString = `select * from [loai_doi_tac] where id='${req.body.id}'`;
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
    var queryString = `DELETE FROM [loai_doi_tac] where id='${req.body.id}'`
    executeQuery(res,queryString,parameters);
})

router.put('/update',(req,res,next)=>
{
    // db.connect().then(() => {
    //     var queryString = `UPDATE [loai_voucher] SET ten='${req.body.ten}' where id='${req.body.id}'`
    //     db.request().query(queryString, (err) => {
    //       if(err) console.log(err)
    //         res.send("Update success")
    //     })
    // })

    var parameters = getParameter(req)
    
    var queryString = `UPDATE [loai_doi_tac] SET ten='${req.body.ten}' where id='${req.body.id}'`
    executeQuery(res,queryString,parameters);
})

module.exports=router;