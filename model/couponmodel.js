const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponName:{
        type:String,
        required:true,
    },
    couponcode:{
        type:String,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    discountAmount:{
        type:Number,
        required:true
    },
    minimumPurchaseAmount:{
        type:Number,
        required:true
    },
    usageLimit:{
        type:Number,
        required:true
    }

})

const Coupon = mongoose.model('Coupon',couponSchema)
module.exports = Coupon