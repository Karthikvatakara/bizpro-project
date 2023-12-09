const couponModel = require('../model/couponmodel')
const moment = require('moment');
const usermodel = require('../model/usermodel');
const cartModel = require('../model/cartmodel');
const { default: mongoose } = require('mongoose');

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

        // const newCoupon = new couponModel({
        //     couponName:couponName,
        //     couponcode:couponcode,
        //     startDate:startDate,
        //     expiryDate:expiryDate,
        //     discountAmount:discountAmount,
        //     minimumPurchaseAmount:minimumPurchaseAmount,
        //     usageLimit:usageLimit
        // })
        const savedCoupon = await couponModel.create(req.body);
        res.redirect('/admin/coupons')
        
    }catch(error){
        console.log(error);
    }
}

const postValidateCoupon = async (req, res) => {
    try {
        console.log(req.body, "namaskaram");
        const user = await usermodel.findOne({ _id: req.session.user._id });
        const { couponCode, numericPart } = req.body;

        const coupon = await couponModel.findOne({ couponcode: couponCode ,Status:'Active'});
        console.log(coupon, "got coupon");

        if (!coupon) {
            console.log("Coupon not found");
            return res.json({ error: "Coupon not found" });
        }

        const currentDate = new Date();

        if (currentDate > coupon.expiryDate) {
            return res.json({ error: "Coupon validity expired" });
        }

        console.log("second else");

        const couponUsed = await usermodel.findOne({
            _id: req.session.user._id,
            'usedCoupons.couponcode': couponCode
        });

        console.log(couponUsed);

        if (couponUsed) {
            for (const Coupon of user.usedCoupons) {
                console.log(Coupon.couponId,"iterated coupon");
                console.log(coupon._id,"user given coupon");
                // console.log(c == coupon._id);
                if((Coupon.couponId).toString() == (coupon._id).toString()){
                    console.log(Coupon.couponId,"GOTID");
                if (Coupon.count >= coupon.usageLimit) {
                    console.log(Coupon.count, "coupon count of the coupon");
                    console.log(coupon.usageLimit, "usagelimit of the coupon");
                    return res.json({
                        error: `Already used ${Coupon.count} number of coupons`
                    });
                } else if (numericPart >= coupon.minimumPurchaseAmount) {
                    await cartModel.updateOne(
                        { userId: req.session.user._id },
                        { coupon: coupon._id },
                        { new: true }
                    );
                    return res.json({
                        success: true,
                        coupon,
                        user
                    });
                } else {
                    return res.json({
                        error: `The minimum purchase amount is ${coupon.minimumPurchaseAmount}`
                    });
                }
                 } }
        } else {
            if (numericPart >= coupon.minimumPurchaseAmount) {
                await cartModel.updateOne(
                    { userId: req.session.user._id },
                    { coupon: coupon._id },
                    { new: true }
                );
                return res.json({ success: true, coupon, user });
            } else {
                return res.json({
                    error: `The minimum purchase amount is ${coupon.minimumPurchaseAmount}`
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({ error: "Internal server error" });
    }
};



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

const changeCouponStatus = async(req,res) =>{
    try{
        const coupon = await couponModel.findOne({_id:req.params.id})
        if(coupon.Status === 'Active'){
            const coupon = await couponModel.findOneAndUpdate({_id:req.params.id},{Status:'Blocked'})
        }else if(coupon.Status === 'Blocked'){
            const coupon = await couponModel.findOneAndUpdate({_id:req.params.id},{Status:'Active'})
        }

        res.redirect('/admin/coupons')
    }catch(error){
        console.log(error);
    }
}

module.exports = {
    adminCoupons,
    postAddCoupon,
    postValidateCoupon,
    postcouponremoval,
    changeCouponStatus
}