const express = require('express');
const router = express.Router();
var mysql_dbc = require('../config/database_mysql')();
var connection = mysql_dbc.init();

/* STEP1 : 마지막 로그인 시점으로부터 1개월 이내인가? && 계약일로부터 1년 경과 하였는가?*/
var STEP1_QUERY = 'select case when DATE_FORMAT(date_sub(curdate(), interval 365 day),\'%Y%m%d\') > a.CONT_START_YMD and left(b.LOGOUT_DT,10) > date_sub(curdate(), interval 90 day) then \'true\' else \'false\' end as \'step1\''
+ ' from FUNERAL_INFO as a' 
+ ' left join ADMIN_INFO as b'
+ ' on a.ADMIN_NO = b.ADMIN_NO'
+ ' where a.FUNERAL_NO = \'664\''

/* STEP2 : 최근 3개월 평균 부고등록 수 * 1.5 보다 큰가? */
var STEP2_QUERY = 'select case when count(bugo_no) > ((select count(*) from BINSO_INFO as b where b.FUNERAL_NO = \'664\' and b.DEL_YN = \'N\' ) * 3* 1.5 ) then \'true\' else \'false\' end as step2'
+ ' from BUGO_INFO as a' 
+ ' where left(a.reg_dt,10) between date_sub(curdate(), interval 90 day) and curdate()'
+ ' and a.FUNERAL_NO = \'664\''
+ ' and a.register_type in (\'admin\',\'api\')'

/* 현재 진행중인 부고 열람수가 300보다 큰가? */
var STEP3_QUERY = 'select sum(a.read_cnt) as step3'
+ ' from BUGO_INFO as a' 
+ ' where left(a.balin_dt,10) >= curdate()'
+ ' and a.FUNERAL_NO = \'664\''

/* STEP4 : 직전 일주일간의 열람수의 총합이 빈소수*100보다 큰가? */
var STEP4_QUERY = 'select case when sum(a.read_cnt) > ((select count(*) from BINSO_INFO as b where b.FUNERAL_NO = \'664\' and b.DEL_YN = \'N\' ) * 100 ) then \'true\' else \'false\' end as step4'
+ ' from BUGO_INFO as a' 
+ ' where left(a.reg_dt,10) between date_sub(curdate(), interval 7 day) and curdate()'
+ ' and a.FUNERAL_NO = \'664\''
+ ' and a.register_type in (\'admin\',\'api\')'

/* STEP5 : 부고 등록수가 증가 추세인가? (최근 6개월 평균 < 최근 2개월 평균)*/
var STEP5_QUERY = 'select count(*) as step5'
+ ' from BUGO_INFO as a'
+ ' where left(a.reg_dt,10) between date_sub(curdate(), interval 180 day) and curdate() and a.FUNERAL_NO = \'350\' and a.register_type in (\'admin\',\'api\')' 
+ ' union all select count(*) * 3'
+ ' from BUGO_INFO as a'
+ ' where left(a.reg_dt,10) between date_sub(curdate(), interval 60 day) and curdate()'
+ ' and a.FUNERAL_NO = \'664\''
+ ' and a.register_type in (\'admin\',\'api\')'

router.get('/ai_william1',(req,res) =>  
    connection.query(STEP1_QUERY, function(err, results) {  
        if (err) {
            return console.log('step1: ' +err)
        }else {
            if(results[0].step1 == 'true') {
                console.log('step1 true start')
                connection.query(STEP2_QUERY, function(err, results){
                    if (err) {
                        return console.log('step2: '+err)
                    }else {
                        if(results[0].step2 == 'true') {
                            console.log(results[0].step2)
                            connection.query(STEP3_QUERY, function(err, results){ 
                                if (err) {
                                    return console.log('step3: ' +err)
                                }else {
                                    if(results[0].step3 > 300) {
                                        connection.query(STEP4_QUERY, function(err, results){ 
                                            if (err) {
                                                return console.log('step4: ' +err)
                                            }else {
                                                if(results[0].step4 == 'true'){
                                                    return res.json({
                                                        message : 'step1-> step2-> step3-> step4 : GROUP A'
                                                    })
                                                } else {
                                                    return res.json({
                                                        message : 'step1-> step2-> step3-> step4 : GROUP B'
                                                    })
                                                }
                                            }
                                        })
                                    }else{
                                        connection.query(STEP5_QUERY, function(err, results){ 
                                            if (err) {
                                                return console.log('step5: ' +err)
                                            }else {
                                                if(results[0].step5 < results[1].step5) {
                                                    return res.json({
                                                        message : 'step1-> step2->step3->step5 : GROUP B'
                                                    })
                                                } else {
                                                    return res.json({
                                                        message : 'step1-> step2->step3->step5 : GROUP C'
                                                    })
                                                } 
                                            }
                                        })
                                    }
                                }
                            })
                        }else{
                            connection.query(STEP4_QUERY, function(err, results){
                                if(err){
                                    return console.log('step4: ' +err)
                                }else{
                                    if(results[0].step4 == 'true'){
                                        connection.query(STEP5_QUERY, function(err, results){
                                            if(err) {
                                                return console.log('step5: ' +err)
                                            }else{
                                                if(results[0].step5 < results[1].step5) {
                                                    return res.json({
                                                        message : 'step1-> step2-> step4 ->step5 : GROUP B'
                                                    })
                                                }else{
                                                    return res.json({
                                                        
                                                        message : 'step1-> step2-> step4 ->step5 : GROUP C '+ results[1].step5
                                                    })
                                                } 
                                            }
                                        })
                                    }else{
                                        return res.json({
                                            message : 'step1-> step2-> step4 : GROUP D'
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }else { 
                console.log('step1 false start')
                connection.query(STEP2_QUERY, function(err, results){ 
                    if(results[0].step2 == 'true') {
                        console.log('step2 true start')
                        if (err) {
                            return console.log('step2: ' +err)
                        } else {
                            connection.query(STEP4_QUERY, function(err, results){ 
                                if (err) {
                                    return console.log('step4: ' +err)
                                }else {
                                    if(results[0].step4 == 'true'){
                                        console.log('step4 true start')
                                        connection.query(STEP5_QUERY, function(err, results){ 
                                            if (err) {
                                                return console.log('step5: ' +err)
                                            } else {
                                                if(results[0].step5 < results[1].steps) {
                                                    console.log('step5 true start')
                                                    console.log(results[0].step5)
                                                    return res.json({
                                                        message : 'step1-> step2 -> step4 -> step5 : GROUP B'
                                                    })
                                                }else {
                                                    console.log('step5 false start')
                                                    console.log(results[0].step5)
                                                    return res.json({
                                                        message : 'step1-> step2 -> step4 -> step5 : GROUP C'
                                                    })
                                                } 
                                            }
                                        })
                                    }else{
                                        console.log('step4 false start')
                                        return res.json({   
                                            message : 'step1-> step2 -> step4 : GROUP C'
                                        })
                                    }
                                }
                            })
                        }
                    }else{
                        console.log('step2 false start')
                        return res.json({   
                            message : 'step1-> step2 : GROUP D'
                        })
                    }  
                })
            }
               
        }
    })
)

module.exports = router;