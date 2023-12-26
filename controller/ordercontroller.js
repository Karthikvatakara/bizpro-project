const productModel = require('../model/productmodel')
const categoryModel = require('../model/categorymodel')
const brandModel = require('../model/brandmodel')
const userModel = require('../model/usermodel')
const moment = require('moment')
const usermodel = require('../model/usermodel')
const adminModel = require('../model/adminmodel')
const bcrypt = require('bcrypt')
const ordermodel = require('../model/ordermodel')
const reviewModel = require('../model/reviewmodel')
const invoice = require('../validator/easyInvoice')
const pdf = require('../validator/pdf')

const getadminorders = async(req,res) => {
    try{
        const page = parseInt(req.query.page) || 1; // Current page (default to 1)
        const perPage = parseInt(req.query.limit) || 10; 
        const order = await ordermodel.find().limit(perPage).sort({_id:-1}).populate('userId')

        const totalCount = await ordermodel.countDocuments();
        const returnedCount = await ordermodel.aggregate([{$match:{Status:'return requested'}},{$count:'count'}])
        // console.log(returnedCount);
        const numberOfReturnRequest = returnedCount[0]?.count
        res.render("admin/adminorders",{order,currentPage:page,perPage,totalCount,totalPages:Math.ceil(totalCount/perPage),numberOfReturnRequest,moment})
    }catch(error){
        console.log(error);
    }
}

const putupdateorderstatus = async(req,res) =>{
try{
// console.log(req.params.id);
console.log(req.body);
const {status} = req.body
// console.log(status);
const neworder = await ordermodel.findByIdAndUpdate(req.params.id,{Status:status},{new:true});
// console.log(neworder);


if(status === 'Delivered'){
    console.log("test");
    neworder.PaymentStatus = 'paid'
}else if(status === 'Rejected'){
    neworder.PaymentStatus = 'order cancelled'
}else {
    if(neworder.PaymentMethod === 'cod'){
        neworder.PaymentStatus = 'pending'
    }
    
}

await neworder.save();
console.log(neworder);

// const updatedOrder = await ordermodel.findById(req.params.id)
res.status(200).json({neworder})

}catch(error){
console.log(error);
}
}

const getorderdetails = async(req,res) =>{
    try{
        console.log(req.params.id);
        const order = await ordermodel.findById(req.params.id).populate('products.productId')
        // console.log(order);
        
        res.render('admin/adminorderviewdetails',{order})
    }catch(error){
        console.log(error);
    }
}

const getuserorderhistory = async(req,res)=>{
    try{
        const order = await ordermodel.find({userId:req.session.user._id}).sort({OrderDate:-1}).populate('products.productId')
        const user = await usermodel.findOne({_id:req.session.user._id})

        const page = parseInt(req.query.page) || 1; // Current page (default to 1)
        const perPage = parseInt(req.query.limit) || 10;    
     

        // const order = await ordermodel.find().sort({_id:-1})

        const totalCount = await ordermodel.countDocuments();
        res.render('user/orderlist',{order,user,currentPage:page,perPage,totalCount,totalPages:Math.ceil(totalCount/perPage),moment})
    }catch(error){
        console.log(error);
    }
}

const getuserorderdetails = async(req,res) =>{
    try{
        const order = await ordermodel.findOne({_id:req.params.id}).populate('products.productId')
        const user = await usermodel.findOne({_id:req.session.user._id})
        // console.log(user);
        res.render('user/orderdetails',{order,user,moment})
    }catch(error){
        console.log(error);
    }
}

const getUserTrackOrderDetails = async(req,res) =>{
    try{
        
        const order = await ordermodel.findOne({userId:req.session.user._id}).sort({_id:-1})
        // console.log(order);
        const orderId = order._id
        // console.log(orderId);
        const user = await usermodel.findOne({_id:req.session.user._id})
        res.redirect(`/order/orderdetails/${orderId}`)
    }catch(error){
        console.log(error);
    }
}

const getuserordercancel = async(req,res) =>{
    try{
        console.log("hai kkkk");
        const  checkavailability = async(Id) => {
        const Order = await ordermodel.findOne({_id:req.params.id})
        for(const product of Order.products) {
            const productData = await productModel.findOne({_id:product.productId})
            const updatedQuantity = productData.AvailableQuantity + product.Quantity
            const updatedProduct = await productModel.findOneAndUpdate({_id:product.productId},{AvailableQuantity:updatedQuantity})
        }

        console.log(Id);
        const order = await ordermodel.findOneAndUpdate({_id:Id},{Status:'Cancelled',PaymentStatus:'order cancelled'},{new:true})
        console.log(order.products);
        }
        // console.log(Order);
        const Order = await ordermodel.findOne({_id:req.params.id})
        if(Order.PaymentMethod === 'cod'){
        await checkavailability(req.params.id);
        res.json({success:true,message:'order cancelled succesfully'})
        }else if(Order.PaymentMethod === "online" || Order.PaymentMethod === "wallet" || Order.PaymentMethod === "wallet+cod" || Order.PaymentMethod === "wallet+online"){
        await checkavailability(req.params.id)

        const walletTransaction = {
            orderId  : Order._id,
            Status: 'Credited',
            Date:new Date(),
            Amount: Order.TotalPrice,
            OrderDetails:'Order Cancelled',
            paymentMethod: Order.PaymentMethod,
            products:Order.products
        }
        console.log(walletTransaction,"wallet transactions");
        console.log("hai reached");
        const user = await usermodel.findByIdAndUpdate(req.session.user._id,{$inc:{WalletAmount:Order.TotalPrice},$push:{walletTransactions:walletTransaction}},{new:true})
        console.log(user);
        console.log(user.WalletAmount);
        res.json({success:true,message:'order cancelled succesfully'})
        }
        
    }catch(error){
        console.log(error);
    }
}

const postorderreturn = async(req,res) =>{
    try{
        // console.log(req.body);
        // console.log(req.params.id);  
        console.log("requested return");
        const returnedReason = req.body.returnReason.toString()
        const order = await ordermodel.findByIdAndUpdate(req.params.id,{returnReason:returnedReason,Status:'return requested'})
        // console.log(order);
        console.log("tttttttt");
        res.json({success:true})
    }catch(error){
        console.log(error);
    }
}

const getreturnrequest = async(req,res) =>{
    try{
        const Page = parseInt(req.query.page) || 1;   // Current page number
        const perPage = 10; // Number of items per page
        const skip = (Page -1)*perPage  // Calculate the number of items to skip

        const order = await ordermodel.find({Status:"return requested"}).skip(skip).limit(perPage)
        const totalCount = await ordermodel.countDocuments({Status:"return requested"})

        res.render('admin/returnrequests',{order,Page,skip,perPage,currentPage:Page,totalCount,totalPages : Math.ceil(totalCount/perPage)})
    }catch(error){
        console.log(error);
    }
}

const  postReturnRequestHandle = async(req,res) =>{
    try{
        console.log(req.body);
        const {input,orderId} = req.body
        
      
        if(input === 'accept') {
            const order = await ordermodel.findOne({_id:orderId}).populate('products.productId')
            const userId = order.userId
            if(order.PaymentStatus === 'paid'){

                const walletTransaction = {
                    orderId  : order._id,
                    Status: 'Credited',
                    Date:new Date(),
                    Amount: order.TotalPrice,
                    OrderDetails:'Order Returned',
                    paymentMethod: order.PaymentMethod,
                    products:order.products
                }

                const user = await usermodel.findOneAndUpdate({_id:userId},{$inc:{WalletAmount:order.TotalPrice},$push:{walletTransactions:walletTransaction}},{new:true})
                console.log(user,"returned user");
                const Order = await ordermodel.findByIdAndUpdate(orderId,{PaymentStatus:"refunded",Status:"returned"},{new:true})

            console.log(order.products,"nnnnnnnnnn");
            order.products.forEach(async(item) => {
                const product = await productModel.findOneAndUpdate({_id:item.productId},{$inc:{AvailableQuantity:item.Quantity}})
                console.log(product);
            })
            }
        }else{
            const order = await ordermodel.findOneAndUpdate({_id:orderId},{Status:"return rejected"},{new:true})
        }
        res.json({succes:true})
    }catch(error){
        console.log(error);
    }
}

const postCancelReturnRequest = async(req,res) => {
    try{
    console.log("hi");
    const order = await ordermodel.findOneAndUpdate({_id:req.params.id},{Status:"Delivered"})
    res.json({success:true})
    }catch(error){
        console.log(error);
    }
}

const postReviewSubmit = async(req,res) =>{
    try{
        // console.log(req.params.id);
    console.log(req.body);
    const {rating,review,productId} = req.body
    const existingReview = await reviewModel.findOne({productId:productId,userId:req.session.user._id})
    console.log(existingReview);
    if(existingReview){
        console.log(rating,'ghj');
        await reviewModel.findByIdAndUpdate(existingReview._id,{rating:rating,reviewText:review})
    }else{
       const newReview = new reviewModel({
        productId: productId,
        userId: req.session.user._id,
        rating: rating,
        reviewText :review
    })
    newReview.save()
}
   
    res.json({success:true})

}
    catch(error){
        console.log(error);
    }
}

const getMyReviews = async(req,res) =>{
    try{
    const user = await userModel.findOne({_id:req.session.user._id})    
    const review = await reviewModel.find({userId:req.session.user._id}).populate('productId')
    res.render('user/myreviews',{review,user})
    }catch(error){
        console.log(error);
    }
}

const postDownloadInvoice = async(req,res) =>{
    try{
        console.log(req.body);
        const order = await ordermodel.findOne({_id:req.params.id}).populate('products.productId').populate('Address').populate('userId')
        const filePath = await invoice(order)
        const orderId = order._id
        res.json(orderId)
    }catch(error){
        console.log(error);
    }
}

const downloadfile = async(req,res) =>{
    try{
    console.log("hai",req.params.id);
    const id = req.params.id
    const filePath = `D:/clonee-bizpro/bizpro/validator/pdf/${id}.pdf`;
    res.download(filePath,`invoice.pdf`)
    }catch(error){
        console.log(error);
    }
}


const getDownloadSalesReport = async (req,res)=>{
    console.log(req.body,"karthik");
    try {
      const startDate = req.body.startDate
      const format = req.body.fileFormat
      const endDate = req.body.endDate

      const orders = await ordermodel.find({
            PaymentStatus: 'paid',
            OrderDate: { $gte: startDate, $lte: endDate } 
        }).populate('products.productId').populate('userId');


      const totalSales = await ordermodel.aggregate([
        {
            $match: {
                PaymentStatus: 'paid',
                OrderDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $group: {
                _id: null,
                totalSales: { $sum: '$TotalPrice' }
            }
        }
    ]);
    
  if(format == 'pdf'){
  const sum = totalSales.length > 0 ? totalSales[0].totalSales : 0;
  pdf.downloadPdf(req,res,orders,startDate,endDate,totalSales)
  }else{
    const sum = totalSales.length > 0 ? totalSales[0].totalSales : 0;
    pdf.downloadExcel(req,res,orders,startDate,endDate,totalSales)
  }
  
    } catch (error) {
      console.log(error);
    }

  }



module.exports = { 
    getadminorders, 
    putupdateorderstatus,
    getorderdetails,
    getuserorderhistory,
    getuserorderdetails,
    getUserTrackOrderDetails, 
    getuserordercancel,
    postorderreturn, 
    getreturnrequest, 
    postReturnRequestHandle, 
    postCancelReturnRequest,    
    postReviewSubmit, 
    getMyReviews,
    postDownloadInvoice,
    downloadfile,
    getDownloadSalesReport
    }