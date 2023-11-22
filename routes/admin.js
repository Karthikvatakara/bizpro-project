const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const adminmodel = require('../model/adminmodel')
// const usercontroller = require('../controller')
const productcontroller = require('../controller/productcontroller')
const admincontroller = require('../controller/admincontroller')
const ordercontroller = require('../controller/ordercontroller')
// const upload = multer({dest:'uploads/'})
const adminAuth = require('../middlewares/adminauth')



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
router.get('/addbanner',admincontroller.getaddbanner)
router.post('/addbanner',upload.fields([{name:'Image',maxCount:1},
                                        {name:'carouselImage1',maxCount:1},
                                        {name:'carouselImage2',maxCount:1}])),admincontroller.postAddBanner

router.get('/adminlogout',adminAuth.authmiddleware,admincontroller.adminlogout)





module.exports = router 
