const couponModel = require('../model/couponmodel')
const moment = require('moment');
const usermodel = require('../model/usermodel');
const cartModel = require('../model/cartmodel')

const adminCoupons = async(req,res) => {
    try{
        const coupons = await couponModel.find();
        res.render('admin/coupon',{coupons,moment})
    }catch(error){
        console.log(error);
    }
}


const postAddCoupon = async(req,res) => {
    try{
        console.log(req.body);
        const{couponName,couponcode,startDate,expiryDate,discountAmount,usageLimit,minimumPurchaseAmount} = req.body

        const newCoupon = new couponModel({
            couponName:couponName,
            couponcode:couponcode,
            startDate:startDate,
            expiryDate:expiryDate,
            discountAmount:discountAmount,
            minimumPurchaseAmount:minimumPurchaseAmount,
            usageLimit:usageLimit
        })
        const savedCoupon = await newCoupon.save();
        res.redirect('/admin/coupons')
        
    }catch(error){
        console.log(error);
    }
}

const postValidateCoupon = async(req,res) =>{
    try{
        console.log(req.body,"namaskaram");
        const user = await usermodel.findOne({_id:req.session.user._id})
        const {couponCode,numericPart} = req.body
        // console.log(couponCode);
        // console.log(numericPart);
        const coupon = await couponModel.findOne({couponcode:couponCode}) 
        console.log(coupon,"got coupon");
        if(!coupon){
            console.log("logged here");
            res.json ({error: "Coupon not found" });
        }else{
            // console.log("exist in else");
            const currentDate = new Date();
            if(currentDate > coupon.expiryDate){
                return res.json({ error:"coupon validity expired"})
            }else{
                console.log("second else");
                const couponUsed = await usermodel.findOne({_id:req.session.user._id,'usedCoupons.couponcode':couponCode})
                console.log(couponUsed);
                if(couponUsed){
                  
                    user.usedCoupons.forEach(async(Coupon)=>{  
                        if(Coupon.count >= coupon.usageLimit){
                            console.log(Coupon.count,"coupon count of the coupon");
                            console.log(coupon.usageLimit,"usagelimit of the coupon");
                            return res.json({error:`already used ${Coupon.count} number of coupons`})
                        }else{
                            
                            if(numericPart >= coupon.minimumPurchaseAmount){
                            await cartModel.updateOne({userId:req.session.user._id},{coupon:coupon,_id},{new:true})
                            res.json({success:true,coupon,user})
                            }else{
                            return res.json({error:`the minimum purchase amount is${coupon.minimumPurchaseAmount}`})
                            }
                            
                        }
                    })
                }else{
                    if(numericPart >= coupon.minimumPurchaseAmount){
                        await cartModel.updateOne({userId:req.session.user._id},{coupon:coupon._id},{new:true})
                        res.json({success:true,coupon,user})
                    }else{
                        return res.json({error:`the minimum purchase amount is${coupon.minimumPurchaseAmount}`})
                    }
                }
            }
        }    
    }catch(error){
        console.log(error);
    }
}

const postcouponremoval = async(req,res)=>{
    try{
    console.log(req.body,"i did hi");
    console.log(req.session.user);
    const cart = await cartModel.updateOne({ userId: req.session.user._id }, { $unset: { coupon: 1 } });
    console.log("tttt");
    res.json({success:true})
    }catch(error){
        res.json({success:false})
        console.log(error);
    }
}

module.exports = {
    adminCoupons,
    postAddCoupon,
    postValidateCoupon,
    postcouponremoval
}