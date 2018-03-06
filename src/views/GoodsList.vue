<template>
    <div>
		<nav-header></nav-header>	
      <nav-bread><span>Goods</span></nav-bread>
      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">Sort by:</span>
            <a href="javascript:void(0)" class="default cur">Default</a>
            <a @click="sortGoods" href="javascript:void(0)" class="price">Price <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg></a>
            <a href="javascript:void(0)" class="filterby stopPop">Filter by</a>
          </div>
          <div class="accessory-result">
            <!-- filter -->
            <div class="filter stopPop" id="filter">
              <dl class="filter-price">
                <dt>Price:</dt>
                <dd><a @click="setPriceFilter('all')" href="javascript:void(0)">All</a></dd>
                
                <dd v-for="(item,index) in priceFilter">
                	<a @click="setPriceFilter(index)" href="javascript:;">
                		{{item.startPrice}} - {{item.endPrice}}
                	</a>
                </dd>
              </dl>
            </div>

            <!-- search result accessories list -->
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="item in goodsList">
                    <div class="pic">
                      <a href="#"><img v-lazy="'static/'+item.productImage" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{item.productName}}</div>
                      <div class="price">{{item.salePrice}}</div>
                      <div class="btn-area">
                        <a @click="addToCart(item.productId)" href="javascript:;" class="btn btn--m">加入购物车</a>
                      </div>
                    </div>
                  </li>
                </ul>
                <div class="view-more-normal"
                   v-infinite-scroll="loadMore"
                   infinite-scroll-disabled="busy"
                   infinite-scroll-distance="20">
                	<img src="./../assets/loading-spinning-bubbles.svg" v-show="load">
              	</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav-footer></nav-footer>
    </div>
</template>
<script>
	import NavHeader from './../components/NavHeader'
	import NavFooter from './../components/NavFooter'
    import NavBread from './../components/NavBread'
    import Modal from './../components/Modal'
    import axios from 'axios'
    export default{
        data(){
            return {
            	sortFlag:true,
                page:1,
                pageSize:8,
            	goodsList: [],
				priceFilter: [
                  {
                      startPrice:'0.00',
                      endPrice:'100.00'
                  },
                  {
                    startPrice:'100.00',
                    endPrice:'500.00'
                  },
                  {
                    startPrice:'500.00',
                    endPrice:'1000.00'
                  },
                  {
                    startPrice:'1000.00',
                    endPrice:'5000.00'
                  }
                ],
                priceLevel: 'all',
                busy: false,
                load: false
            }
        },
        components:{
        	NavHeader,
        	NavFooter,
        	NavBread,
        	Modal
        },
        methods:{
          //获得商品    
          getGoodsList(flag){
            //接口参数
            var param = {
              //当前页
              page: this.page,
              //每一页数量
              pageSize: this.pageSize,
              //排序
              sort: this.sortFlag ? 1 : -1,
              //价格区间
              priceLevel: this.priceLevel
            }
            //请求的时候显示加载
            this.load = true;
            //get传参方法
            axios.get('goods/list',{
              params: param
            }).then((res) => {
              this.load = false;
              var data = res.data;
              if(data.status == '0'){
                //this.goodsList = this.goodsList.concat(data.result.list);
                //flag 判断是否要分页加载数据
                if(flag){
                  //拼接数据
                  this.goodsList = this.goodsList.concat(data.result.list);
                  if(data.result.count == 0){
                    this.busy = true;
                  }else{
                    this.busy = false;
                  }
                }else{
                  this.goodsList = data.result.list;
                }
              }
            })
          },
          sortGoods(){
            this.sortFlag = !this.sortFlag;
            this.page = 1;
            this.getGoodsList();
          },
          loadMore(){
            this.busy = true;
            setTimeout(()=>{
              this.page++;
              this.getGoodsList(true);
            },500);
          },
          //选择价格区间后得到数据
          setPriceFilter(val){
            this.priceLevel = val;
            this.page = 1;
            this.getGoodsList();
          },
          //添加到购物车
          addToCart(id){
            console.log(id)
            axios.post('/goods/addCart',{
              productId:id
            }).then((res)=>{
              var data = res.data;
              if(data.status == 0){
                alert('添加成功');
                //vuex 更新购物车数量
                this.$store.commit("updateCartCount",1);
              }else{
                alert('添加失败');
              }
            })
          }
        },
        mounted(){
          this.getGoodsList();    
        }
    }
</script>
