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


/* FUNEARAL_MESSAGE_1 : @funeral_nm 장례식장의 부고를 현재까지 @read_cnt명이 열람하였습니다.*/
var FUNERAL_MESSAGE_1_QUERY = 'select b.FUNERAL_NM as funeral_nm, FORMAT(sum(a.READ_CNT),0) as read_cnt'
+ ' from BUGO_INFO as a'
+ ' left join FUNERAL_INFO as b' 
+ ' on a.FUNERAL_NO = b.FUNERAL_NO'
+ ' where a.FUNERAL_NO = \'664\''
+ ' and a.register_type in (\'admin\',\'api\')'
+ ' group by funeral_nm'

/* FUNEARAL_MESSAGE_2 : @funeral_nm 에서 현재까지 @sangju_count명의 상주가 부고서비스를 이용하였습니다.*/
var FUNERAL_MESSAGE_2_QUERY = 'select c.FUNERAL_NM as funeral_nm, FORMAT(count(*),0) as sangju_cnt'
+ ' from SANGJU_INFO as a'
+ ' left join BUGO_INFO as b' 
+ ' on a.BUGO_NO = b.BUGO_NO'
+ ' left join FUNERAL_INFO as c'
+ ' on b.FUNERAL_NO = c.FUNERAL_NO'
+ ' where b.FUNERAL_NO = \'664\''
+ ' group by funeral_nm'

/* FUNEARAL_MESSAGE_3 : @funeral_nm 전송된 부고당 평균 @read_count의 조문객이 열람하였습니다.*/
var FUNERAL_MESSAGE_3_QUERY = 'select b.FUNERAL_NM as funeral_nm, FORMAT(AVG(a.read_cnt),0) as read_cnt'
+ ' from BUGO_INFO as a'
+ ' left join FUNERAL_INFO as b' 
+ ' on a.FUNERAL_NO = b.FUNERAL_NO'
+ ' where a.FUNERAL_NO = \'664\''
+ ' and a.read_cnt > 30'

/* FUNEARAL_MESSAGE_4 : 지난 일주일간 @funeral_nm 장례식장의 부고를 @read_cnt명의 조문객이 열람하였습니다.*/
var FUNERAL_MESSAGE_4_QUERY = 'select b.FUNERAL_NM as funeral_nm, FORMAT(sum(a.READ_CNT),0) as read_cnt'
+ ' from BUGO_INFO as a'
+ ' left join FUNERAL_INFO as b' 
+ ' on a.FUNERAL_NO = b.FUNERAL_NO'
+ ' where left(a.reg_dt,10) between date_sub(curdate(), interval 7 day) and curdate()'
+ ' and a.FUNERAL_NO = \'664\''
+ ' and a.register_type in (\'admin\',\'api\')'
+ ' group by funeral_nm'

/* FUNEARAL_MESSAGE_5 : 전년 대비 최근 3개월 부고당 평균 열람수가 % 증가하였습니다.*/
var FUNERAL_MESSAGE_5_QUERY = 'select b.FUNERAL_NM as funeral_nm, AVG(a.read_cnt) as read_cnt'
+ ' from BUGO_INFO as a'
+ ' left join FUNERAL_INFO as b' 
+ ' on a.FUNERAL_NO = b.FUNERAL_NO'
+ ' where a.FUNERAL_NO = \'664\''
+ ' and left(a.REG_DT,10) between date_sub(curdate(), interval 90 day) and curdate()'
+ ' union all'
+ ' select b.FUNERAL_NM as funeral_nm, AVG(a.read_cnt) as read_cnt'
+ ' from BUGO_INFO as a'
+ ' left join FUNERAL_INFO as b' 
+ ' on a.FUNERAL_NO = b.FUNERAL_NO'
+ ' where a.FUNERAL_NO = \'664\''
+ ' and left(a.REG_DT,10) between date_sub(curdate(), interval 455 day) and date_sub(curdate(), interval 365 day)'



/* REGION_MESSAGE_1 :  @region 지역의 부고를 현재까지 @read_cnt명이 열람하였습니다.*/
var FUNEARAL_MESSAGE_1_QUERY = 'select case when b.TEL1 = \'031\' then \'경기\''
+ 'when  b.TEL1 = \'032\' then \'인천\''
+ 'when b.TEL1 = \'033\' then \'강원\''
+ 'when b.TEL1 = \'02\' then \'서울\''
+ 'when b.TEL1 = \'042\' then \'대전\''
+ 'when b.TEL1 = \'043\' then \'충북\''
+ 'when b.TEL1 = \'041\' then \'충남\''
+ 'when b.TEL1 = \'044\' then \'세종\''
+ 'when b.TEL1 = \'051\' then \'부산\''
+ 'when b.TEL1 = \'052\' then \'울산\''
+ 'when b.TEL1 = \'053\' then \'대구\''
+ 'when b.TEL1 = \'054\' then \'경북\''
+ 'when b.TEL1 = \'055\' then \'경남\''
+ 'when b.TEL1 = \'061\' then \'전남\''
+ 'when b.TEL1 = \'062\' then \'광주\''
+ 'when b.TEL1 = \'063\' then \'전북\''
+ 'when b.TEL1 = \'064\' then \'제주\''
+ 'end as region,' 
+ 'count(*) as read_cnt'
+ 'from BUGO_INFO as a'
+ 'left join FUNERAL_INFO as b'
+ 'on a.FUNERAL_NO = b.FUNERAL_NO'
+ 'where b.TEL1 in (select c.tel1 from FUNERAL_INFO as c  where c.FUNERAL_NO = \'664\' )'
+ 'group by tel1'



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
                                                    const message_type = Math.floor(Math.random()*5 + 1);
                                                    const message_seq = Math.floor(Math.random()*7 + 1);
                                                    
                                                    console.log('message_type : ' + message_type+', ' + 'message_seq : ' +message_seq);
                                                    switch(message_seq) {
                                                        case 1: connection.query(FUNERAL_MESSAGE_1_QUERY, function(err, results){
                                                            if(err){
                                                                return console.log('message1' + err )
                                                            }else{
                                                                return res.json({
                                                                    groupInfo : 'step1-> step2-> step4 ->step5 : GROUP B',
                                                                    message : results[0].funeral_nm+'의 부고를 현재까지 ' + results[0].read_cnt + '명의 조문객이 열람하였습니다.' 
                                                                   // @funeral_nm 장례식장의 부고를 현재까지 @read_cnt명이 열람하였습니다.'
                                                                })
                                                            }
                                                        })
                                                        break;

                                                        case 2: connection.query(FUNERAL_MESSAGE_2_QUERY, function(err, results){
                                                            if(err){
                                                                return console.log('message2' + err )
                                                            }else{
                                                                return res.json({
                                                                    groupInfo : 'step1-> step2-> step4 ->step5 : GROUP B',
                                                                    message : results[0].funeral_nm+'에서 현재까지 ' +results[0].sangju_cnt+ '명의 상주가 부고서비스를 이용하였습니다.' 
                                                                   // @funeral_nm 에서 현재까지 @sangju_count명의 상주가 부고서비스를 이용하였습니다.'
                                                                })
                                                            }
                                                        })
                                                        break;

                                                        case 3: connection.query(FUNERAL_MESSAGE_3_QUERY, function(err, results){
                                                            if(err){
                                                                return console.log('message3' + err )
                                                            }else{
                                                                return res.json({
                                                                    groupInfo : 'step1-> step2-> step4 ->step5 : GROUP B',
                                                                    message : results[0].funeral_nm+'의 전송된 부고당 평균 ' +results[0].read_cnt+ '명의 조문객이 열람하였습니다.' 
                                                                   // @funeral_nm 전송된 부고당 평균 @read_count의 조문객이 열람하였습니다.
                                                                })
                                                            }
                                                        })
                                                        break;
                                                    
                                                        case 4: connection.query(FUNERAL_MESSAGE_4_QUERY, function(err, results){
                                                            if(err){
                                                                return console.log('message4' + err )
                                                            }else{
                                                                return res.json({
                                                                    groupInfo : 'step1-> step2-> step4 ->step5 : GROUP B',
                                                                    message : '지난 일주일간 '+ results[0].funeral_nm+ '의 부고를 ' +results[0].read_cnt+ '명의 조문객이 열람하였습니다.' 
                                                                   // [FUNERAL_MESSAGE_1_QUERY] message :  results[0].funearl_nm + '의 부고를 현재까지 ' + results[0].read_cnt+ '명이 열람하였습니다.'
                                                                })
                                                            }
                                                        })
                                                        break;

                                                        case 5: connection.query(FUNERAL_MESSAGE_5_QUERY, function(err, results){
                                                        if(err){
                                                            return console.log('message5' + err )
                                                        }else{
                                                            return res.json({
                                                                groupInfo : 'step1-> step2-> step4 ->step5 : GROUP B',
                                                                message :  results[0].funeral_nm + '의 최근 3개월 전년 대비 부고당 평균 열람수가 '+ (results[1].read_cnt - results[0].read_cnt)/results[0].read_cnt*100 +'% 증감 하였습니다.' 

                                                            })
                                                        }
                                                        })
                                                        break;

                                                        case 6: return res.json({
                                                                    groupInfo : 'step1-> step2-> step4 ->step5 : GROUP B',
                                                                    message :  '장례식장/상주의 서비스 이용관련 불편사항을 365일 24시간 문의를 받고 있습니다.' 
                                                                })
                                                            break;


                                                        case 7: return res.json({
                                                                    groupInfo : 'step1-> step2-> step4 ->step5 : GROUP B',
                                                                    message :  '대표상주 이외에 딸, 사위까지의 연락처를 추가적으로 입력을 하면 부고 열람수가 높아집니다.'
                                                                    })
                                                            break;    
                                                    }
                                                }else {
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
                                                    connection.query(FUNERAL_MESSAGE_5_QUERY, function(err, results){
                                                        if(err){
                                                            return console.log('message1' + err )
                                                        }else{
                                                            return res.json({
                                                                groupInfo : 'step1-> step2-> step4 ->step5 : GROUP B',
                                                                message :  results[0].funearl_nm + '의 최근 3개월 전년 대비 부고당 평균 열람수가'+ results[1].read_cnt - results[0].read_cnt+'증가하였습니다.' 
                                                                // [FUNERAL_MESSAGE_1_QUERY] message :  results[0].funearl_nm + '의 부고를 현재까지 ' + results[0].read_cnt+ '명이 열람하였습니다.' 
                                                            })
                                                        }
                                                })
                                                }else{
                                                    connection.query(REGION_MESSAGE_1_QUERY, function(err, results){
                                                        if(err){
                                                            return console.log('message1' + err )
                                                        }else{
                                                            return res.json({
                                                                groupInfo : 'step1-> step2-> step4 ->step5 : GROUP C ',
                                                                message :  results[0].region + '지역에서 현재까지 ' + results[0].read_cnt+ '명이 열람하였습니다.' 
                                                            })
                                                        }
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