const productModel = require('../model/productmodel')
const categoryModel = require('../model/categorymodel')
const brandModel = require('../model/brandmodel')
const userModel = require('../model/usermodel')
const moment = require('moment')
const usermodel = require('../model/usermodel')
const adminModel = require('../model/adminmodel')
const bcrypt = require('bcrypt')
const ordermodel = require('../model/ordermodel')
const bannerModel = require('../model/bannermodel')
const mongoose = require("mongoose");

// kkjkj


const getuserlist = async(req,res) => {
    const searchQuery = req.query.search || '';
    const page = parseInt(req.query.page) || 1; // Current page (default to 1)
    const perPage = parseInt(req.query.limit) || 10;

    try{

        const filter = {};
        if(searchQuery) {
            filter.name = { $regex: new RegExp(searchQuery,'i')};
        }
       console.log(filter)

      const skip = (page - 1) * perPage;

      const users = await userModel.find(filter).skip(skip).limit(perPage).sort({_id:-1});
      const totalCount = await userModel.countDocuments(filter);

        res.render('admin/manageusers',{users,currentPage:page,perPage,totalCount,totalPages:Math.ceil(totalCount/perPage),searchQuery})
    }catch(error){
        console.log(error);
        res.redirect('/admin/manageusers')
    }
}


const userblock = async(req,res) => {
    try{
        // console.log(req.params.id)
        const user = await userModel.findById({_id:req.params.id})
        // console.log(user);
        if(user.Status == 'Active') {
            const user = await userModel.findByIdAndUpdate({_id:req.params.id},{Status:'Blocked'})
        }else if(user.Status == 'Blocked') {
            const user = await userModel.findByIdAndUpdate({_id:req.params.id},{Status:'Active'})
        }
        // console.log(user.Status);
        res.redirect('/admin/userlist')
        }catch(error){
        console.log(error);
    }   
}

const getadminlogin = async(req,res) => {
    try{
        res.render('admin/adminlogin')
    }catch(error){
        console.log(error);
    }
}

// admin logged
// const postadminlogin = async(req,res) => {
//     try{
//         console.log(req.body);
//         req.body.password = await bcrypt.hash(req.body.password,10)
//         const admin = await adminModel.create(req.body)
//         res.send("admin logged")
//     }catch(error){
//         console.log(error);
//     }
// }

const postadmincheck = async(req,res) => {
    try{
        // console.log(req.body);
        const admin = await adminModel.findOne({email:req.body.email})   
        if(admin) {
            passwordmatch = await bcrypt.compare(req.body.password,admin.password)

            if(passwordmatch) {
                req.session.adminAuth = true
                res.redirect('/admin/dashboard')
            } else{
                res.redirect('/admin/adminlogin')
            }
        } else{
            res.redirect('/admin/adminlogin')
        }    
    }catch(error){
        console.log(error);
        res.redirect('/admin/adminlogin')
    }
}

const adminlogout = async(req,res) => {
    try{
        req.session.adminAuth = false
        res.redirect('/admin/adminlogin')
    }catch(error){
        console.log(error);
    }
}


const getbanner = async(req,res)=>{
    try{
        const currentBanner = await bannerModel.findOne({Status:'Enabled'})
        const banners = await bannerModel.find()
        res.render('admin/banner',{currentBanner:currentBanner,banners:banners,message:req.flash()})
    }catch(error){
        console.log(error);
    }
}

const getaddbanner = async(req,res) =>{
    try{
        res.render('admin/addbanner')
    }catch{
        console.log(error);
    }
}

const postAddBanner = async(req,res) =>{
    try{
        console.log(req.files);
        if(req.files['carouselImage1'] && req.files['carouselImage2']){
            const carosal =[
                req.files['carouselImage1'][0].filename,
                req.files['carouselImage2'][0].filename,
            ];

            const newBanner = new bannerModel({
                BannerName:req.body.bannerName,
                Image:req.files['Image'][0].filename,
                carosel:carosal,
                Date:new Date(),
            })
            await newBanner.save();
            res.redirect('/admin/banner')
        }
    }catch(error){
        console.log(error,'in submit the banner catch');
    }
}

const activateBanner = async(req,res) =>{
    try{
        const existingBanner = await bannerModel.findOne({Status:'Enabled'});
        const bannerId = new mongoose.Types.ObjectId(req.params.id)
        if(existingBanner) {
            existingBanner.Status = 'Disabled';
            await existingBanner.save();
        }

        if(existingBanner ?._id == bannerId) {
            req.flash('existing',"it is the current status")
            res.redirect('/admin/banner')
        }

        const banner = await bannerModel.findOneAndUpdate(
            {_id:req.params.id},
            {Status:'Enabled'},
            {new:true}
        )
        req.flash('BannerUpdated','banner updated succesfully')
        res.redirect('/admin/banner')
    }catch(error){
        console.log(error);
    }
}


const deleteBanner = async(req,res) => {
    try{
        const banner = await bannerModel.findOneAndDelete({_id:req.params.id})
        console.log(banner);

        if(banner){
            req.flash("BannerDeleted","banner deleted succesfully")
            res.redirect('/admin/banner')
        }
    }catch(error){
        console.log(error);
    }
}


const getdashboard = async(req,res)=>{
    try{
        res.render('admin/dashboard')
    }catch(error){
        console.log(error);
    }
}

const getcount = async(req,res)=>{
    try {
        const orders = await ordermodel.find({
          Status: {
            $nin:["returned","Cancelled","Rejected"]
          }
        });
        const orderCountsByDay = {};
        const totalAmountByDay = {};
        const orderCountsByMonthYear = {};
        const totalAmountByMonthYear = {};
        const orderCountsByYear = {};
        const totalAmountByYear = {};
        let labelsByCount;
        let labelsByAmount;
        let dataByCount;
        let dataByAmount;
        orders.forEach((order) => {
          const orderDate = moment(order.OrderDate, "ddd, MMM D, YYYY h:mm A");
          const dayMonthYear = orderDate.format("YYYY-MM-DD");
          const monthYear = orderDate.format("YYYY-MM");
          const year = orderDate.format("YYYY");
          
          if (req.url === "/count-orders-by-day") {
            if (!orderCountsByDay[dayMonthYear]) {
              orderCountsByDay[dayMonthYear] = 1;
              totalAmountByDay[dayMonthYear] = order.TotalPrice
            } else {
              orderCountsByDay[dayMonthYear]++;
              totalAmountByDay[dayMonthYear] += order.TotalPrice
            }
            const ordersByDay = Object.keys(orderCountsByDay).map(
              (dayMonthYear) => ({
                _id: dayMonthYear,
                count: orderCountsByDay[dayMonthYear],
              })
            );
            const amountsByDay = Object.keys(totalAmountByDay).map(
              (dayMonthYear) => ({
                _id: dayMonthYear,
                total: totalAmountByDay[dayMonthYear],
              })
            );
            amountsByDay.sort((a,b)=> (a._id < b._id ? -1 : 1));
            ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
            labelsByCount = ordersByDay.map((entry) =>
              moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
            );
            labelsByAmount = amountsByDay.map((entry) =>
              moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
            );
            dataByCount = ordersByDay.map((entry) => entry.count);
            dataByAmount = amountsByDay.map((entry) => entry.total);
  
  
          } else if (req.url === "/count-orders-by-month") {
            if (!orderCountsByMonthYear[monthYear]) {
              orderCountsByMonthYear[monthYear] = 1;
              totalAmountByMonthYear[monthYear] = order.TotalPrice;
            } else {
              orderCountsByMonthYear[monthYear]++;
              totalAmountByMonthYear[monthYear] += order.TotalPrice;
            }
          
            const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
              (monthYear) => ({
                _id: monthYear,
                count: orderCountsByMonthYear[monthYear],
              })
            );
            const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
              (monthYear) => ({
                _id: monthYear,
                total: totalAmountByMonthYear[monthYear],
              })
            );
          
            ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
            amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
          
            labelsByCount = ordersByMonth.map((entry) =>
              moment(entry._id, "YYYY-MM").format("MMM YYYY")
            );
            labelsByAmount = amountsByMonth.map((entry) =>
              moment(entry._id, "YYYY-MM").format("MMM YYYY")
            );
            dataByCount = ordersByMonth.map((entry) => entry.count);
            dataByAmount = amountsByMonth.map((entry) => entry.total);
          } else if (req.url === "/count-orders-by-year") {
            // Count orders by year
            if (!orderCountsByYear[year]) {
              orderCountsByYear[year] = 1;
              totalAmountByYear[year] = order.TotalPrice;
            } else {
              orderCountsByYear[year]++;
              totalAmountByYear[year] += order.TotalPrice;
            }
          
            const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
              _id: year,
              count: orderCountsByYear[year],
            }));
            const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
              _id: year,
              total: totalAmountByYear[year],
            }));
          
            ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
            amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
          
            labelsByCount = ordersByYear.map((entry) => entry._id);
            labelsByAmount = amountsByYear.map((entry) => entry._id);
            dataByCount = ordersByYear.map((entry) => entry.count);
            dataByAmount = amountsByYear.map((entry) => entry.total);
          }
        });
  
  
        res.json({ labelsByCount,labelsByAmount, dataByCount, dataByAmount });
      } catch (err) {
        console.error(err);
      }
}


const getOrdersAndSellers = async(req,res) =>{
    console.log("helloooooo");
    try {
        const latestOrders = await ordermodel.find().sort({ _id: -1 }).limit(5)
        const bestSeller = await ordermodel.aggregate([
          {
            $match: {
              Status: 'Delivered',
            },
          },
          {
            $unwind: "$products",
          },
          {
            $group: {
              _id: "$products.productId",
              totalCount: { $sum: "$products.Quantity" },
            },
          },
          {
            $sort: {
              totalCount: -1,
            },
          },
          {
            $limit: 10,
          },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $unwind: "$productDetails",
          },
        ]);
        console.log('bestsellleeers',bestSeller)
        if (!latestOrders || !bestSeller) throw new Error("No Data Found");
        res.json({ latestOrders, bestSeller });
      } catch (error) {
        console.log(error);
      }
}

module.exports = {
    getuserlist,
    userblock,
    getadminlogin,
    postadmincheck,
    adminlogout,
    getbanner,
    getaddbanner,
    postAddBanner,
    activateBanner,
    deleteBanner,
    getdashboard,
    getcount,
    getOrdersAndSellers
    }