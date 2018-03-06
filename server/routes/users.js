var express = require('express');
var router = express.Router();
var User = require('./../models/user');
require('./../util/util')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//登录
router.post('/login',function(req,res,next){
	//组合参数
	var param = {
		userName: req.body.userName,
		userPwd: req.body.userPwd
	}
	//在数据库中查找是否有该用户
	User.findOne(param,(err,doc)=>{
		if(err){
			res.json({
				status: '1',
				msg: err.message
			});
		}else{
			if(doc){
				//设置浏览器端cookie
				res.cookie('userId',doc.userId,{
					path: '/',
					maxAge: 1000*60*60
				});
				res.cookie("userName",doc.userName,{
	        path:'/',
	        maxAge:1000*60*60
	      });
				res.json({
					status: '0',
					msg: '',
					result:{
						userName: doc.userName
					}
				});
			}
		}
	});
});
//取消登录
router.get('/loginout',(req,res,next)=>{
	//设置浏览器端cookie过时
	res.cookie('userId','',{
		path: '/',
		maxAge: -1
	});
	res.json({
		status: 0,
		msg: '',
		result: ''
	});
});
// 检测登录
router.get("/checkLogin", function (req,res,next) {
  if(req.cookies.userId){
      res.json({
        status:'0',
        msg:'',
        result:req.cookies.userName || ''
      });
  }else{
    res.json({
      status:'1',
      msg:'未登录',
      result:''
    });
  }
});
// 获得购物车数量
router.get('/getCartCount',(req,res,next)=>{
	if(req.cookies && req.cookies.userId){
		var userId = req.cookies.userId;
		User.findOne({userId: userId},(err,doc)=>{
			if(err){
				res.json({
					status: '1',
					msg: err.message,
				});
			}else{
				let cartList = doc.cartList;	
				let cartCount = 0;
				cartList.map((item)=>{
					//默认商品数量为string 需要强制转换成数字
					cartCount += parseInt(item.productNum);
				});
				res.json({
					status: '0',
					msg: '',
					result: cartCount
				});
			}
		});
	}else{
		res.json({
			status: '1',
			msg: '当前用户不存在'
		});
	}
})
// router.get("/getCartCount", function (req,res,next) {
//   if(req.cookies && req.cookies.userId){
//     console.log("userId:"+req.cookies.userId);
//     var userId = req.cookies.userId;
//     User.findOne({"userId":userId}, function (err,doc) {
//       if(err){
//         res.json({
//           status:"0",
//           msg:err.message
//         });
//       }else{
//         let cartList = doc.cartList;
//         let cartCount = 0;
//         cartList.map(function(item){
//           cartCount += parseFloat(item.productNum);
//         });
//         res.json({
//           status:"0",
//           msg:"",
//           result:cartCount
//         });
//       }
//     });
//   }else{
//     res.json({
//       status:"0",
//       msg:"当前用户不存在"
//     });
//   }
// });
//得到购物车信息
router.get('/cartList',(req,res,next)=>{
	//服务器端得到用户名
	var userId = req.cookies.userId;
	//通过用户名得到用户信息
	User.findOne({userId: userId},(err,doc)=>{
		if(err){
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		}else{
			if(doc){
				res.json({
					status: '0',
					msg: '',
					//存放购物车信息
					result: doc.cartList
				});
			}
		}
	});
});
//删除购物车信息
router.post('/delCart',(req,res,next)=>{
	//req.cookies.userId得到信息
	//res.cookie('userId',userId) 设置浏览器cookie
	var userId = req.cookies.userId,productId = req.body.productId;
	//$pull 删除信息可以用$pull
	User.update({
    'userId':userId
  },{
    '$pull':{
      'cartList':{
        'productId':productId
      }
    }
  }, (err,doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      });
    }
  });
});
//修改商品数量和选中商品
router.post('/cartEdit',(req,res,next)=>{
	//服务器通过cookie得到用户id
	//req.body得到url中的参数
	var userId = req.cookies.userId,
		productId = req.body.productId,
		productNum = req.body.productNum,
		checked = req.body.checked;
		//更新数据库中某个集合的子集中信息的办法，更新对应userid表中cartList集合下的商品id为productId的信息
		//$在这里为占位符
		User.update({"userId": userId,"cartList.productId": productId},{
			"cartList.$.productNum": productNum,
			"cartList.$.checked": checked
		},function(err,doc){
			if(err){
				res.json({
					status:'1',
					msg:err.message,
					result:''
				});
			}else{
				res.json({
					status:'0',
					msg:'',
					result:'suc'
				});
			}
		});
});

//购物车点击选择所有商品
router.post("/editCheckAll", function (req,res,next) {
	var userId = req.cookies.userId,
			//得到checkAll为布尔值，代表商品是否选择，设置服务端checkAll为字符串0或者1
      checkAll = req.body.checkAll?'1':'0';
  User.findOne({userId:userId}, function (err,user) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      if(user){
				//循环遍历客户购物车列表,改变checked属性
        user.cartList.forEach((item)=>{
          item.checked = checkAll;
				})
				//数据库信息更改后需要保存
        user.save(function (err1,doc) {
            if(err1){
              res.json({
                status:'1',
                msg:err1,message,
                result:''
              });
            }else{
              res.json({
                status:'0',
                msg:'',
                result:'suc'
              });
            }
        })
      }
    }
  });
});

//获得地址信息列表
router.get('/addressList',(req,res,next)=>{
	//通过cookies得到用户id
	var userId = req.cookies.userId;
	//通过userId查找
	User.findOne({userId: userId},(err,doc)=>{
		if(err){
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		} else{
			res.json({
        status:'0',
        msg:'',
        result:doc.addressList
      });
		}
	});
});

//设置默认地址接口
router.post('/setDefault',(req,res,next)=>{
	var userId = req.cookies.userId,
		addressId = req.body.addressId;
	User.findOne({userId: userId},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else{
			var addressList = doc.addressList;
			addressList.forEach((item)=>{
				//判断addressId是否相等
				if(item.addressId ==addressId){
					 item.isDefault = true;
				}else{
					item.isDefault = false;
				}
			});
			//保存
			doc.save(function (err1,doc1) {
				if(err){
					res.json({
						status:'1',
						msg:err.message,
						result:''
					});
				}else{
						res.json({
							status:'0',
							msg:'',
							result:''
						});
				}
			})
		}
	});
});

//router. //删除地址
router.post('/delAddress',(req,res,next)=>{
	var userId = req.cookies.userId,
		//req.body用的是哪个包
		addressId = req.body.addressId;
		//$pull 删除
	User.update({userId: userId},{
		$pull: {
			'addressList': {
				'addressId': addressId
			}
		}
	},(err,doc)=>{
		if(err){
			res.json({
					status:'1',
					msg:err.message,
					result:''
			});
		}else{
			res.json({
				status:'0',
				msg:'',
				result:addressId
			});
		}
	});
});

// pay
router.post("/payMent", function (req,res,next) {
  var userId = req.cookies.userId,
    addressId = req.body.addressId,
    orderTotal = req.body.orderTotal;
  User.findOne({userId:userId}, function (err,doc) {
     if(err){
        res.json({
            status:"1",
            msg:err.message,
            result:''
        });
     }else{
       var address = '',goodsList = [];
       //获取当前用户的地址信息
       doc.addressList.forEach((item)=>{
          if(addressId==item.addressId){
            address = item;
          }
       })
       //获取用户购物车的购买商品
       doc.cartList.filter((item)=>{
         if(item.checked=='1'){
           goodsList.push(item);
         }
       });
			 // 默认平台码
       var platform = '622';
       var r1 = Math.floor(Math.random()*10);
       var r2 = Math.floor(Math.random()*10);
			 //系统时间
			 var   sysDate = new Date().Format('yyyyMMddhhmmss');
			 //创建订单时的时间
			 var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
			 // 订单id
			 var orderId = platform+r1+sysDate+r2;
			 //订单信息
       var order = {
          orderId:orderId,
          orderTotal:orderTotal,
          addressInfo:address,
          goodsList:goodsList,
          orderStatus:'1',
          createDate:createDate
       };
			// 将订单存放到集合
       doc.orderList.push(order);
			//保存
       doc.save(function (err1,doc1) {
          if(err1){
            res.json({
              status:"1",
              msg:err.message,
              result:''
            });
          }else{
            res.json({
              status:"0",
							msg:'',
							//支付成功返回订单id和订单总价,在支付成功页面显示
              result:{
                orderId:order.orderId,
                orderTotal:order.orderTotal
              }
            });
          }
       });
     }
  })
});

//根据订单Id查询订单信息
router.get("/orderDetail", function (req,res,next) {
	//获得 get 传参用param
  var userId = req.cookies.userId,orderId = req.param("orderId");
  User.findOne({userId:userId}, function (err,userInfo) {
      if(err){
          res.json({
             status:'1',
             msg:err.message,
             result:''
          });
      }else{
				 var orderList = userInfo.orderList;
				 //订单列表长度不为0
         if(orderList.length>0){
           var orderTotal = 0;
           orderList.forEach((item)=>{
							// 查找对应订单id
              if(item.orderId == orderId){
                orderTotal = item.orderTotal;
              }
           });
           if(orderTotal>0){
						 //订单价格 >0
             res.json({
               status:'0',
               msg:'',
               result:{
                 orderId:orderId,
                 orderTotal:orderTotal
               }
             })
           }else{
						 // 订单 价格<0 
             res.json({
               status:'120002',
               msg:'无此订单',
               result:''
             });
           }
         }else{
           res.json({
             status:'120001',
             msg:'当前用户未创建订单',
             result:''
           });
         }
      }
  })
});

module.exports = router;
