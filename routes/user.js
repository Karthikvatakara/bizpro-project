const express = require('express')
const router = express.Router()
const user = require('../model/usermodel')
const userAuth = require('../middlewares/userauth')
const cartcontroller = require('../controller/cartcontroller')
const ordercontroller = require('../controller/ordercontroller')
const usercontroller = require('../controller/usercontroller')
const cart = require('../model/cartmodel')
const couponcontroller = require('../controller/couponcontroller')

router.get('/home',usercontroller.viewproduct)

router.get('/login',userAuth.authmiddleware,usercontroller.login)
router.post('/login',usercontroller.postlogin)

router.get('/signup',userAuth.authmiddleware,usercontroller.signup)
router.post('/signup',usercontroller.logged)

router.get('/signup/:id',usercontroller.getreferelsignup)
router.post('/signup/:id',usercontroller.logged)

router.get('/emailverification',userAuth.authmiddleware,usercontroller.getemailverification)
router.post('/emailverification',usercontroller.otpAuth,usercontroller.postemailverification)

router.get('/resendotp',userAuth.userToken,usercontroller.resendotp)


router.get('/forgotpassword',userAuth.authmiddleware,usercontroller.getforgotpassword)
router.post('/forgotpassword',userAuth.userToken,usercontroller.postforgotpassword)

router.get('/forgototp',userAuth.authmiddleware,usercontroller.getforgototp)
router.post('/forgototp',userAuth.userToken,usercontroller.postforgototp)

router.get('/forgotpasscheck',userAuth.authmiddleware,usercontroller.getforgotpasscheck)
router.post('/forgotpasscheck',userAuth.userToken,usercontroller.postforgotpasscheck)

router.get('/usershop',userAuth.userexist,usercontroller.getusershop)
router.get('/usershop/category/:id',userAuth.userexist,usercontroller.getusershop)
router.get('/usershop/brand/:id',userAuth.userexist,usercontroller.getusershop)


router.get('/logout',usercontroller.logout)

router.get('/product/:id',userAuth.userToken,usercontroller.getproduct)

router.get('/addtocart/:id',userAuth.userToken,cartcontroller.getusercart)

router.get('/cart',userAuth.userToken,cartcontroller.getcartinside)
router.get('/cartForSafeer',userAuth.userToken,cartcontroller.getcartinsideForSafeer)
router.post('/cart',userAuth.userToken,cartcontroller.postcart)

router.get('/profilecart',userAuth.userToken,cartcontroller.getprofilecart)

router.post('/updateQuantity',userAuth.userToken,cartcontroller.updatingquantity)

router.get('/removefromcart/:id',userAuth.userToken,cartcontroller.getremovefromcart)

router.get('/profile',userAuth.userToken,usercontroller.getProfile)

router.get('/address',userAuth.userToken,usercontroller.getaddress)
router.post('/addaddress',userAuth.userToken,usercontroller.postaddaddress)

router.post('/addaddress-checkout',userAuth.userToken,usercontroller.getaddaddresscheckout)

router.post('/editaddress/:id',userAuth.userToken,usercontroller.posteditaddress)

router.get('/deleteaddress/:id',userAuth.userToken,usercontroller.getdeleteaddress)

router.get('/checkout',userAuth.userToken,cartcontroller.getcheckout)
router.post('/checkout',userAuth.userToken,cartcontroller.postcheckout)

router.get('/ordersuccess',userAuth.userToken,cartcontroller.getordersuccess)

router.get('/orderhistory',userAuth.userToken,ordercontroller.getuserorderhistory)
router.get('/order/orderdetails/:id',userAuth.userToken,ordercontroller.getuserorderdetails)

router.get('/trackorder',userAuth.userToken,ordercontroller.getUserTrackOrderDetails)

router.post('/order/cancel/:id',userAuth.userToken,ordercontroller.getuserordercancel)

router.post('/verify-payment',userAuth.userToken,cartcontroller.postverifypayment)

router.post('/order/return/:id',userAuth.userToken,ordercontroller.postorderreturn)
router.post('/order/cancelReturnRequest/:id',userAuth.userToken,ordercontroller.postCancelReturnRequest)

router.post('/review/submit',userAuth.userToken,ordercontroller.postReviewSubmit)

router.get('/wallet',userAuth.userToken,usercontroller.getUserWallet)

router.get('/myreviews',userAuth.userToken,ordercontroller.getMyReviews)

router.post('/downloadInvoice/:id',userAuth.userToken,ordercontroller.postDownloadInvoice)

router.get('/download/invoice/:id',userAuth.userToken,ordercontroller.downloadfile)

router.post('/edit-profile', userAuth.userToken,usercontroller.postEditProfile)

router.get('/coupons-and-offers',userAuth.userToken,usercontroller.getuserCoupons)
router.post('/validateCoupon',userAuth.userToken,couponcontroller.postValidateCoupon)
router.post('/couponremoval',userAuth.userToken,couponcontroller.postcouponremoval)

router.post('/home/search',usercontroller.navbarsearch)

router.post('/walletcheckout',userAuth.userToken,cartcontroller.postWalletCheckout)

// router.get('/wishlist',userAuth.userToken,usercontroller.getwishlist)
// router.get('/addToWishlist/:id',userAuth.userToken,usercontroller.addToWishlist)
// router.get('/removeFromWishlist/:_id',userAuth.userToken,usercontroller.removeFromWishlist)
module.exports = router