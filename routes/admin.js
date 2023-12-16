const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const adminmodel = require('../model/adminmodel')
const productcontroller = require('../controller/productcontroller')
const admincontroller = require('../controller/admincontroller')
const ordercontroller = require('../controller/ordercontroller')
const adminAuth = require('../middlewares/adminauth')
const couponcontroller = require('../controller/couponcontroller')
const admin = require('../model/adminmodel')


router.get('/adminaddproduct',adminAuth.authmiddleware,productcontroller.getadminaddproduct)
router.post('/adminaddproduct',adminAuth.authmiddleware,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1}]),productcontroller.postadminaddproduct)

router.get('/addcategory',adminAuth.authmiddleware,productcontroller.getaddcategory)
router.post('/addcategory',adminAuth.authmiddleware,upload.single('imageUrl'),productcontroller.postaddcategory)

router.get('/addbrands',adminAuth.authmiddleware,productcontroller.getaddbrands)
router.post('/addbrands',adminAuth.authmiddleware,productcontroller.postaddbrands)

router.get('/editcategory/:id',adminAuth.authmiddleware,productcontroller.geteditcategory)
router.post('/editcategory/:id',adminAuth.authmiddleware,upload.single('imageUrl'),productcontroller.posteditcategory)

router.get('/categoriesandbrands',adminAuth.authmiddleware,productcontroller.getcategoriesandbrands)

router.get('/adminshowproduct',adminAuth.authmiddleware,productcontroller.getadminshowproduct)

router.get('/editproduct/:id',adminAuth.authmiddleware,productcontroller.geteditproduct)
router.post('/editproduct/:id',adminAuth.authmiddleware,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1}]),productcontroller.posteditproduct)

router.get('/adminproduct/:id',adminAuth.authmiddleware,productcontroller.getadminproduct)

router.get('/userlist',adminAuth.authmiddleware,admincontroller.getuserlist)
router.get('/userlist/:id',adminAuth.authmiddleware,admincontroller.userblock)

router.get('/adminorders',adminAuth.authmiddleware,ordercontroller.getadminorders)
router.put('/updateorderstatus/:id',adminAuth.authmiddleware,ordercontroller.putupdateorderstatus)
router.get('/order/orderdetails/:id',adminAuth.authmiddleware,ordercontroller.getorderdetails)
router.get('/orders/return-request',adminAuth.authmiddleware,ordercontroller.getreturnrequest)
router.post('/order/returnRequestHandle',adminAuth.authmiddleware,ordercontroller.postReturnRequestHandle)

router.get('/adminlogin',adminAuth.adminexist,admincontroller.getadminlogin)
router.post('/adminlogin',admincontroller.postadmincheck)

router.get('/deletecategory/:id',adminAuth.authmiddleware,productcontroller.getdeletecategory)

router.get('/banner',adminAuth.authmiddleware,admincontroller.getbanner)
router.get('/addbanner',adminAuth.authmiddleware,admincontroller.getaddbanner)
router.post('/addbanner',adminAuth.authmiddleware,upload.fields([{name:'Image',maxCount:1},
                                        {name:'carouselImage1',maxCount:1},
                                        {name:'carouselImage2',maxCount:1}]),admincontroller.postAddBanner)
router.post('/activate-banner/:id',adminAuth.authmiddleware,admincontroller.activateBanner)
router.post('/delete-banner/:id',adminAuth.authmiddleware,admincontroller.deleteBanner)

router.get('/coupons',adminAuth.authmiddleware,couponcontroller.adminCoupons)
router.post('/addcoupon',adminAuth.authmiddleware,couponcontroller.postAddCoupon)

router.get('/dashboard',adminAuth.authmiddleware,admincontroller.getdashboard)

router.get('/count-orders-by-day',adminAuth.authmiddleware,admincontroller.getcount)
router.get('/count-orders-by-month',adminAuth.authmiddleware,admincontroller.getcount)
router.get('/count-orders-by-year',adminAuth.authmiddleware,admincontroller.getcount)
router.get('/latestOrders',adminAuth.authmiddleware,admincontroller.getOrdersAndSellers)
router.post('/download-sales-report',adminAuth.authmiddleware,ordercontroller.getDownloadSalesReport)

router.get('/adminlogout',adminAuth.authmiddleware,admincontroller.adminlogout)
router.get('/coupon/:id',adminAuth.authmiddleware,couponcontroller.changeCouponStatus)

module.exports = router 
