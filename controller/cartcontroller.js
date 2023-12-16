const categoryModel = require('../model/categorymodel')
const brandModel = require('../model/brandmodel')
const cartModel = require('../model/cartmodel')
const productModel = require('../model/productmodel')
const usermodel = require('../model/usermodel')
const ordermodel = require('../model/ordermodel')
const moment  = require('moment')
const nodemailer = require('nodemailer')
const Razorpay = require('../validator/razorpay')
const razorpay = require('razorpay')
const crypto = require('crypto')
const mongoose = require("mongoose");
const { findOne } = require('../model/couponmodel')
const couponmodel = require('../model/couponmodel')
const { v4:uuidv4} = require('uuid'); 

const getusercart = async(req,res)=> {
    try{
        // console.log('hai');
        const userId = req.session.user._id
        const productId = req.params.id;
        console.log(userId,'TEST1');
        const usercart = await cartModel.findOne({userId:userId})
        console.log(usercart)
        // console.log(usercart);
        if(usercart === null) {
            const newusercart = new cartModel({
                userId: new mongoose.Types.ObjectId(userId),
                products:[{
                    productId:productId,
                    Quantity:1
                }],
            });
            console.log(userId,"unniii")
            await newusercart.save()
        }else{
            const product = usercart.products.find(product => product.productId.equals(productId));
            console.log(product);
            if (!product) {
                usercart.products.push({
                    productId: productId,
                    Quantity: 1
                });
            } else {
                const quantity = product.Quantity
                console.log(quantity);
                const newproduct = await productModel.findOne({_id:productId})
                // console.log(newproduct);
                if(quantity == newproduct.AvailableQuantity) {
                    await cartModel.findOneAndUpdate({'userId':userId,'products.productId':productId},{$inc:{'products.$.Quantity':0}})
                    return res.redirect('/cart')

                }
                await cartModel.findOneAndUpdate({'userId':userId,'products.productId':productId},{$inc:{'products.$.Quantity':1}})
            }
            await usercart.save();
        }     
       res.redirect('/cart')

    }catch(error){
        console.log(error);
    }
}


const updatingquantity = async (req, res) => {
    try {
      const { productId, change } = req.body;

      const userId = req.session.user._id;

      const userCart = await cartModel.findOne({ userId: userId });
      const product = await productModel.findById(productId);
      if (!userCart || !product) {
        return res.status(404).json({ error: "Product or cart not found" });
      }
      const cartItem = userCart.products.find((item) =>
        item.productId.equals(productId)
      );
      if (!cartItem) {
        return res.status(404).json({ error: "Product or cart not found" });
      }
      const newQuantity = cartItem.Quantity + parseInt(change);
      if (newQuantity < 1) {
        userCart.products = userCart.products.filter(
          (item) => !item.productId.equals(productId)
        );
      } else {
        cartItem.Quantity = newQuantity;
      }

      await userCart.save();
      res.json({ message: "Quantity updated successfully", newQuantity });
    } catch (error) {
      console.error("Error updating quantity:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  const getcartinside = async(req,res) => {
    try{
        const error = req?.query?.error;
        const message = req?.query?.message;
        if(error){
          req.flash('error', message);
        }
        const cart = await cartModel.findOne({userId:req.session.user._id}).populate('products.productId').populate('coupon')
        res.render('user/cart',{user:req.session.user,cart,messages:req.flash()})
    }catch(error){
      console.log(`an error happened ${error}`);
    }
  }

  const getcartinsideForSafeer = async(req,res) => {
    try{
        const cart = await cartModel.findOne({userId:req.session.user._id}).populate('products.productId')
        res.render('user/cart',{user:req.session.user,cart,messages:req.flash()})
    }catch(error){
      console.log(`an error happened ${error}`);
    }
  }

  const getremovefromcart = async(req,res) => {
    try{
      const product = await cartModel.findOneAndUpdate({userId:req.session.user._id},{$pull:{products:{productId:req.params.id}}}) 
    //    console.log(product);
    const cart = await cartModel.findOne({userId:req.session.user._id}).populate('coupon')
    const Cart = await cartModel.findOne({userId:req.session.user._id}).populate('products.productId')
    
    // console.log(Cart.products,"removing");

    
    if(cart.coupon){
      const minAmount = cart.coupon.minimumPurchaseAmount;
      let totalPrice = 0;
      for(const cartItem of Cart.products){
        totalPrice += cartItem.productId.Price * cartItem.Quantity;
        console.log(totalPrice,"TOTOAL");
        console.log(minAmount,"MINIMUM");
      }
      if(totalPrice < minAmount) {
        const cart = await cartModel.updateOne({ userId: req.session.user._id }, { $unset: { coupon: 1 } });
         return res.redirect('/cart')
      }
    }
    res.redirect('/cart')
    }catch(error){
        console.log(error);
    }
  }

  const getcheckout = async(req,res) => {
    try{
      const user = await usermodel.findById(req.session.user._id)
      console.log(user,"mgo");
      const cart = await cartModel.findOne({userId:req.session.user._id})
      // console.log(cart.products);
      const havingProducts = cart?.products?.length || 0;
      if(havingProducts >0) {
      res.render('user/checkout',{user})
      }else {
        req.flash('error',"no products in the cart")
        res.redirect('/cart')
      }
    }catch(error){
      console.log(error);
    }
  }

  const postcart = async(req,res) => {
    try{
      
      const convertNum = req.body.totalPrice
      const TotalPrice = convertNum.replace(/[^\d.]/g, '');
      req.body.totalPrice = parseFloat(TotalPrice)


      req.session.totalPrice = req.body.totalPrice
      // console.log(req.session.totalPrice,"reached total price");
      const cartProduct = await cartModel.findOne({userId:req.session.user._id})
      
      let isRedirected = false

      for(const product of cartProduct.products) {
        cartquantity = product.Quantity
        
        const Product = await productModel.findOne({_id:product.productId})
        // console.log(Product);

        if(!product) {
          req.flash('err',"product not found")
          isRedirected = true;
          break;
        }

        if(cartquantity >Product.AvailableQuantity || Product.AvailableQuantity ==0){
          // console.log(Product.AvailableQuantity);
          req.flash('err',"the product is out of stock")
          isRedirected = true
          break;
        }
      };

      if(isRedirected) {
        return res.redirect('/cart')
      }
      res.redirect('/checkout')
      
    }catch(error){
      console.log(error);
    }
  }


  const postcheckout = async(req,res) =>{
    try{

      let redirected = false;
      console.log(req.body);
      const { AddressId,paymentMethod} = req.body
      if(!AddressId){
        console.log("noaddress");
        return res.json({address:true,status:true})
      }
      
      const cart = await cartModel.findOne({userId:req.session.user._id})
      console.log(cart,"gorhoihoihoihyh");

      for(const product of cart.products){
        console.log("in for");
        cartQuantity = product.Quantity                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
        const Product = await productModel.findOne({_id:product.productId})
        if(!Product) {
          console.log('there is no product');
          req.flash("error",'product is not available')
          redirected = true
          res.json({status: false, url: '/cart', err: true, messages:'product is not available'});   
        }
        else if(cartQuantity > Product.AvailableQuantity || Product.AvailableQuantity == 0) {
          console.log('in else');
          req.flash("error",`only ${Product.AvailableQuantity} is in stock`)
          console.log(req.flash());

          redirected = true
          res.json({status: false, url: '/cart',err:true, messages:`only ${Product.AvailableQuantity} is in stock`});   
        }
      }

      // console.log(cart);
      if (redirected === false ) {
  
      // const userId = req.session.user._id
      // const products = cart.products
      
      const TotalPrice = req.session.totalPrice
      const address = await usermodel.findOne({_id:req.session.user._id, 'Address._id':AddressId},{'Address.$':1})
      const Address = {
        Name:address.Address[0].Name,
        AddressLane:address.Address[0].AddressLane,
        City:address.Address[0].City,
        Pincode:address.Address[0].Pincode,
        State:address.Address[0].State,
        Mobile:address.Address[0].Mobile
      }
      
      const currentDate = new Date();
      const expectedDeliveryDate = new Date(currentDate);
      expectedDeliveryDate.setDate(currentDate.getDate() + 4);
      const uniqueOrderId = uuidv4()
      console.log(uniqueOrderId,"uniqueOrderId of order")

      const couponCart = await cartModel.findOne({ userId: req.session.user._id });
      let couponDetials
      console.log(couponCart,"jabir ");
      if(couponCart?.coupon){
        couponDetials = await couponmodel.findOne({_id:couponCart.coupon})
        console.log(couponDetials);
      }
      
      const couponObj = {
        couponname:couponDetials?.couponName,
        couponcode:couponDetials?.couponcode,
        discountAmount:couponDetials?.discountAmount
      }
        let neworders;
      if(couponCart.coupon){
         neworders = new ordermodel({
          userId: req.session.user._id,
          products: [],
          PaymentMethod: paymentMethod,
          TotalPrice: req.session.totalPrice,
          Address: Address,
          OrderDate: currentDate,
          ExpectedDeliveryDate: expectedDeliveryDate,
          coupon: couponObj,
          orderUuid:uniqueOrderId
        });
      }else{
         neworders = new ordermodel({
          userId: req.session.user._id,
          products: [],
          PaymentMethod: paymentMethod,
          TotalPrice: req.session.totalPrice,
          Address: Address,
          OrderDate: currentDate,
          ExpectedDeliveryDate: expectedDeliveryDate,
          orderUuid:uniqueOrderId
          
        });
      }
      
      
      for (const product of cart.products) {
        const Product = await productModel.findOne({ _id: product.productId });
        neworders.products.push({
          productId: Product._id,
          name: Product.ProductName,
          price: Product.Price,
          Quantity: product.Quantity,
        });
      }


      
      console.log(neworders);
      console.log("ivide ethi karthik");
      

      async function userCouponInsert(){
        const cart = await cartModel.findOne({ userId:req.session.user._id }).populate('coupon');
        if(cart?.coupon){
        
          const user = await usermodel.findOne({_id:req.session.user._id,'usedCoupons.couponId':cart.coupon._id})
          if(user){
          const user = await usermodel.findOneAndUpdate({_id:req.session.user._id,'usedCoupons.couponId':cart.coupon._id},{$inc:{'usedCoupons.$.count':1}},{new:true})
          // const coupon = {
          //   couponname:cart.coupon.couponName,
          //   couponcode:cart.coupon.couponcode,
          //   discountAmount:cart.coupon.discountAmount
          // }
          // console.log(coupon,"coupn inserted in the order");
          // neworders.coupon.push(coupon)

          }else{
            const coupon = {
              couponId:cart.coupon._id,
              couponName:cart.coupon.couponName,
              couponcode:cart.coupon.couponcode,
            }
        // console.log(coupon,"coupon inserted first");
        // neworders.coupon.push(coupon)
        console.log(cart.coupon._id);

        const updateUser = await usermodel.findOneAndUpdate({_id:req.session.user._id},{$push:{usedCoupons:coupon}})
        
        const UpdateUser = await usermodel.findOneAndUpdate(
          {_id:req.session.user._id, 'usedCoupons.couponId': cart.coupon._id},
          {$inc: {'usedCoupons.$.count': 1}},
          {new: true}
        );
        const Cart = await cartModel.findOneAndUpdate({userId:req.session.user._id},{$unset:{coupon:1}})
        }
        }}

    if(paymentMethod === 'cod'){
      // console.log("safeer");
      
      const orders = await neworders.save()
      userCouponInsert();
      
      
      const deletedcart = await cartModel.findByIdAndDelete(cart._id)   
    // console.log(orders);

    for(const product of orders.products){
      console.log(product._id,"PRODUCT ID");
      console.log(product.Quantity,"PRODUCT QUANTITY");
      const Product = await productModel.findById(product.productId)
      if(Product){
        const newQuantity = Product.AvailableQuantity - product.Quantity
        // console.log(newQuantity);
        if(newQuantity <= 0) {
          Product.AvailableQuantity = 0;
          Product.Status = "OUT OF STOCK"
          await Product.save();
        }else{
          Product.AvailableQuantity =Product.AvailableQuantity - product.Quantity
          await Product.save();
        }
      }else{
        req.flash("error","product is not found")
        res.json({status:false,url:'/cart'})
      }
    }
    

        const user = req.session.user
        const email = req.session.user.email
      const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'karthikbrototype@gmail.com',
            pass: 'belj vqwu rxtc bmjr',
          },
        })
       
        ///otp sending
        const maildata = {
          from:'karthikbrototype@gmail.com',
          to:email,
          subject:"OTP FROM BIZPRO",
          html: `<p>otp from bizpro</p> <p style="color:tomato; font-size:25px; letter-spacing:3px"><b>Hello ${user.name} Your order has been received and will be processed within one bussiness Day .your total price is ${req.session.totalPrice}</b></p>`
        }

        transporter.sendMail(maildata,(error,info) => {
          if(error) {
            console.log(email,"haiiiiiii");
              return console.log(error);
          }
        })
        console.log("reaching hhhhhhhhai");
        res.json({status:false,codsuccess:true,url:'/ordersuccess'})

      }else if(paymentMethod ==='online'){
        
        const orders = await neworders.save()  ///order is placed//
        userCouponInsert();
        const orderdetails =  {
          amount:orders.TotalPrice,
          receipt:orders._id,
        }
        const user = await usermodel.findOne({_id:req.session.user._id})
        const order = await Razorpay.createRazorpayOrder(orderdetails)
        console.log(order,"hiiiiii");
        
        
        for(const product of orders.products){
          console.log(product._id,"PRODUCT ID");
          console.log(product.Quantity,"PRODUCT QUANTITY");
          const Product = await productModel.findById(product.productId)
          if(Product){
            const newQuantity = Product.AvailableQuantity - product.Quantity
            // console.log(newQuantity);
            if(newQuantity <= 0) {
              Product.AvailableQuantity = 0;
              Product.Status = "OUT OF STOCK"
              await Product.save();
            }else{
              Product.AvailableQuantity =Product.AvailableQuantity - product.Quantity
              await Product.save();
              const deletedcart = await cartModel.findByIdAndDelete(cart._id)   //cart deleted//
            }
          }else{
            req.flash("err","product is not found")
            res.rediret('/cart')
          }
          console.log(order,user)
          res.json({status: true,order,user})
        }


      }else if(paymentMethod === "wallet"){
        // console.log(req.session.totalPrice);
        const user = await usermodel.findOne({_id:req.session.user._id})
        // console.log(user.WalletAmount)
        const totalPrice = req.session.totalPrice
        const WalletAmount = user.WalletAmount
        console.log(WalletAmount);
        if(WalletAmount >= totalPrice){
          const orders = await neworders.save() 

          for(const product of orders.products){
            console.log(product._id,"PRODUCT ID");
            console.log(product.Quantity,"PRODUCT QUANTITY");
            const Product = await productModel.findById(product.productId)
            if(Product){
              const newQuantity = Product.AvailableQuantity - product.Quantity
              // console.log(newQuantity);
              if(newQuantity <= 0) {
                Product.AvailableQuantity = 0;
                Product.Status = "OUT OF STOCK"
                req.flash('err',"product is out of stock")
                await Product.save();
              }else{
                Product.AvailableQuantity =Product.AvailableQuantity - product.Quantity
                await Product.save();
              }
            }else{
              req.flash("error","product is not found")
              res.json({status:false,url:'/cart'})
            }
          }

           userCouponInsert();
          const deletedcart = await cartModel.findByIdAndDelete(cart._id)   //cart deleted//

          res.json({status:true,codsuccess:true,url:'/ordersuccess'})

          const walletTransaction = {
            orderId  : orders._id,
            Status: 'Debited',
            Date:new Date(),
            Amount: orders.TotalPrice,
            OrderDetails:'Order Placed',
            paymentMethod: orders.PaymentMethod,
            products:orders.products
        }

          const remainingAmount = WalletAmount-totalPrice
          const user = await usermodel.findByIdAndUpdate(req.session.user._id,{WalletAmount:remainingAmount,$push:{walletTransactions:walletTransaction}},{new:true})
          const order = await ordermodel.findOneAndUpdate({_id:orders._id},{PaymentStatus:"paid"})
          console.log(user);
          console.log(order);
        }else{
          if( WalletAmount == 0){
            console.log("wallet is 0");
            res.json({status:true,emptyWallet:true})
          }else{
          console.log("jjjjjj");
          // req.flash("error",`the wallet contains only ${WalletAmount} rupees`)
          // res.json({status:false,url:'/cart'})
          res.json({status:true,wallet:true,WalletAmount,totalPrice,Address,neworders,cart})
        
          }
        }
      }
    }

    }catch(error){
      console.log(error);
    }
  }


  const getordersuccess = async(req,res) => {
    try{
      const user = await usermodel.findOne({_id:req.session.user._id})
      res.render('user/orderSuccess',{user})
    }catch(error){
      console.log(error);
    } 
  }

  const getprofilecart = async(req,res) =>{
    try{
      const user = await usermodel.findOne({_id:req.session.user._id})
      const cart = await cartModel.findOne({userId:req.session.user._id}).populate('products.productId')
      
      res.render('user/profilecart',{user,cart})
    }catch(error){
      console.log(error);
    }
  }


  const postverifypayment = async(req,res) =>{
    try{
      console.log(req.body,"verifypayment");
      function generateSignature(data, secret) {
        const hmac = crypto.createHmac('sha256', 'kI2Wwrnm0R3qsx0GbvgrErXm');
        hmac.update(data);
        return hmac.digest('hex');
    }
      console.log("reached");
      const generatedSignature = generateSignature(req.body.payment.razorpay_order_id + "|" + req.body.payment.razorpay_payment_id,'kI2Wwrnm0R3qsx0GbvgrErXm')
      // console.log(req.body);
      // console.log(generatedSignature);
      // console.log(req.body.payment.razorpay_signature);
      if(generatedSignature === req.body.payment.razorpay_signature){
        const orderId = new mongoose.Types.ObjectId( req.body.order.receipt);
        const updatedorder = await ordermodel.findByIdAndUpdate(orderId,{PaymentStatus:"paid",Status:"Order Placed"})
        console.log(updatedorder);
        const deletedcart = await cartModel.findOneAndDelete({userId:req.session.user._id})
        console.log(updatedorder);
        res.json({success:true, url:'/ordersuccess'})
      }else{
        res.status(403).json({success:false,error:"invalid signature"})
      }
    }catch(error){
      console.log(error);  
    }
  }

  const postWalletCheckout = async(req,res) =>{
    try{
      const {selectedPaymentMethod, WalletAmount,totalPrice,OrderDetails,cart}  =req.body

      async function userCouponInsert(){
        const cart = await cartModel.findOne({ userId:req.session.user._id }).populate('coupon');
        if(cart.coupon){
        
          const user = await usermodel.findOne({_id:req.session.user._id,'usedCoupons.couponId':cart.coupon._id})
          if(user){
          const user = await usermodel.findOneAndUpdate({_id:req.session.user._id,'usedCoupons.couponId':cart.coupon._id},{$inc:{'usedCoupons.$.count':1}},{new:true})

          }else{
            const coupon = {
              couponId:cart.coupon._id,
              couponName:cart.coupon.couponName,
              couponcode:cart.coupon.couponcode,
            }
        console.log(cart.coupon._id);

        const updateUser = await usermodel.findOneAndUpdate({_id:req.session.user._id},{$push:{usedCoupons:coupon}})
        
        const UpdateUser = await usermodel.findOneAndUpdate(
          {_id:req.session.user._id, 'usedCoupons.couponId': cart.coupon._id},
          {$inc: {'usedCoupons.$.count': 1}},
          {new: true}
        );
        const Cart = await cartModel.findOneAndUpdate({userId:req.session.user._id},{$unset:{coupon:1}})
        }
        }}

      if(selectedPaymentMethod == 'cod')   {
        const newOrders = new ordermodel(OrderDetails)
        const orders = await newOrders.save() 
        userCouponInsert();
        const deletedcart = await cartModel.findByIdAndDelete(cart._id)  

        const multiplePayment = await ordermodel.findOneAndUpdate(
          { _id: orders._id },
          {
            $set: { 'isMultiplePayment.isMultiple': true },
            $inc: { 'isMultiplePayment.Amount': WalletAmount }
          }
        );
        console.log(multiplePayment,"multiplepayment");
        const wallet = await usermodel.findOneAndUpdate({_id:req.session.user._id},{$inc:{WalletAmount:-WalletAmount}})
        const WalletTransaction = {
          orderId  : orders._id,
          Status: 'Debited',
          Date:new Date(),
          Amount: WalletAmount,
          OrderDetails:'Order Placed',
          paymentMethod: "wallet+cod",
          products:orders.products
      }

        const User = await usermodel.findOneAndUpdate({_id:req.session.user._id},{$push:{walletTransactions:WalletTransaction}})
         const Orders = await ordermodel.findOneAndUpdate({_id:orders._id},{PaymentMethod:"wallet+cod"})
        console.log("again reached here?");

        for(const product of orders.products){
          console.log(product._id,"PRODUCT ID");
          console.log(product.Quantity,"PRODUCT QUANTITY");
          const Product = await productModel.findById(product.productId)
          if(Product){
            const newQuantity = Product.AvailableQuantity - product.Quantity
            // console.log(newQuantity);
            if(newQuantity <= 0) {
              Product.AvailableQuantity = 0;
              Product.Status = "OUT OF STOCK"
              await Product.save();
            }else{
              Product.AvailableQuantity =Product.AvailableQuantity - product.Quantity
              await Product.save();
            }
          }else{
            req.flash("error","product is not found")
            res.json({status:false,url:'/cart'})
          }
        }
        console.log("lllll");
        res.json({status:false,codsuccess:true,url:'/ordersuccess'})


      }else if(selectedPaymentMethod == 'online'){

        const newOrders = new ordermodel(OrderDetails)
        const orders = await newOrders.save() 
        userCouponInsert();

        const orderdetails =  {
          amount:orders.TotalPrice-WalletAmount,
          receipt:orders._id,
        }
        const user = await usermodel.findOne({_id:req.session.user._id})
        const order = await Razorpay.createRazorpayOrder(orderdetails)
        console.log(order,"hiiiiii");
        

        const deletedcart = await cartModel.findByIdAndDelete(cart._id)  

        const multiplePayment = await ordermodel.findOneAndUpdate(
          { _id: orders._id },
          {
            $set: { 'isMultiplePayment.isMultiple': true },
            $inc: { 'isMultiplePayment.Amount': WalletAmount }
          }
        );
        console.log(multiplePayment,"multiplepayment");
        const wallet = await usermodel.findOneAndUpdate({_id:req.session.user._id},{$inc:{WalletAmount:-WalletAmount}})
        const WalletTransaction = {
          orderId  : orders._id,
          Status: 'Debited',
          Date:new Date(),
          Amount: WalletAmount,
          OrderDetails:'Order Placed',
          paymentMethod: "wallet+online",
          products:orders.products
      }

        const cuurentUser = await usermodel.findOneAndUpdate({_id:req.session.user._id},{$push:{walletTransactions:WalletTransaction}})
        console.log("hi iam karthik");
         const Orders = await ordermodel.findOneAndUpdate({_id:orders._id},{PaymentMethod:"wallet+online"},{new: true})
         console.log(orders._id,'hhh');
         console.log(Orders.PaymentMethod,"jjjjjjjjj");
        // console.log(Orders.PaymentMethod,"again reached here?");

        for(const product of orders.products){
          console.log(product._id,"PRODUCT ID");
          console.log(product.Quantity,"PRODUCT QUANTITY");
          const Product = await productModel.findById(product.productId)
          if(Product){
            const newQuantity = Product.AvailableQuantity - product.Quantity
            // console.log(newQuantity);
            if(newQuantity <= 0) {
              Product.AvailableQuantity = 0;
              Product.Status = "OUT OF STOCK"
              await Product.save();
            }else{
              Product.AvailableQuantity =Product.AvailableQuantity - product.Quantity
              await Product.save();
              const deletedcart = await cartModel.findByIdAndDelete(cart._id)   //cart deleted//
            }
          }else{
            req.flash("err","product is not found")
            res.rediret('/cart')
          }
          console.log(order,user)
          res.json({status: true,onlineSuccess:true,order,user})
        }
      }

    }catch(error){  
      console.log(error);
    }
  }

module.exports = {
  getusercart, 
  updatingquantity, 
  getremovefromcart,
  getcartinside, 
  getcheckout, 
  postcart, 
  postcheckout,
  getordersuccess, 
  getprofilecart, 
  postverifypayment, 
  getcartinsideForSafeer,
  postWalletCheckout
}