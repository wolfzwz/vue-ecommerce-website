var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');


//链接数据库
mongoose.connect('mongodb://127.0.0.1:27017/test');
mongoose.connection.on('connected',function(){
	console.log("Mongodb connected success");
});
mongoose.connection.on('error',function(){
	console.log("Mongodb connected error");
});
mongoose.connection.on('disconnected',function(){
	console.log("Mongodb connected disconnected");
});

/* GET home page. */
router.get('/list', function(req, res, next) {
  let page = req.param('page');
  let pageSize = parseInt(req.param('pageSize'));
  let priceLevel = req.param('priceLevel');
  let sort = req.param('sort');
  let skip = (page - 1) * pageSize;
  let params = {};
  var priceGt = '',priceLte = '';
  if(priceLevel !='all'){
  	switch(priceLevel){
  		case '0':
  			priceGt = 0;
  			priceLte = 100;
		break;
  		case '1':
  			priceGt = 100;
  			priceLte = 500;
		break;
  		case '2':
  			priceGt = 500;
  			priceLte = 1000;
		break;
  		case '3':
  			priceGt = 1000;
  			priceLte = 5000;
		break;
  	}
  	params = {
	  	salePrice:{
	  		$gt: priceGt,
	  		$lte: priceLte
	  	}
  	}
  }
  
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice':sort});
  
  goodsModel.exec((err,doc) => {
  	if(err){
  		res.json({
  			status:'1',
  			msg: err.message
  		});
  	}else{
  		res.json({
  			status: '0',
  			msg:'',
  			result:{
  				count: doc.length,
  				list: doc
  			}
  		})
  	}
  });
});

router.post('/addCart',function(req,res,next){
	let userId = '100000077',productId = req.body.productId;
	let users = require('../models/user');
	users.findOne({userId},function(err,userdoc){
		if(err){
			res.json({
				status: '1',
				msg: err.message
			});
		}else{
			if(userdoc){
				let goodsItem = 0; 
				userdoc.cartList.forEach((item)=>{
					if(item.productId == productId){
						item.productNum ++;
						goodsItem = 1;
					}
				})
				if(goodsItem){
					userdoc.save((err2,doc)=>{
						if(err2){
							res.json({
								status: '1',
								msg: err2.message
							});
						}else{
							res.json({
			                  status:'0',
			                  msg:'',
			                  result:'su'
			                })
						}
					});
				}else{
					Goods.findOne({productId},(err,doc)=>{
						if(err){
			                res.json({
			                  status:"1",
			                  msg:err.message
			                })
		                }else{
		                	if(doc){
		                		doc.productNum = 1;
		                		doc.checked = 1;
		                		userdoc.cartList.push(doc);
		                		userdoc.save(function (err2,doc2) {
				                    if(err2){
				                      res.json({
				                        status:"1",
				                        msg:err2.message
				                      })
				                    }else{
				                      res.json({
				                        status:'0',
				                        msg:'',
				                        result:'suc'
				                      })
				                    }
			                    })
		                	}
		                }
					});
				}
			}
		}
	});
});

module.exports = router;
