const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Userschema = new Schema( {
    name:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String
        
    },
    confirmpassword:{
        type:String
    },
    token:{
        type:String
    },
    Address: [{
        Name: {type: String},
        AddressLane: { type: String },
        City: { type: String },
        Pincode: { type: Number },
        State: { type: String },
        Mobile: { type: Number },
     }],
     Status:{
        type:String,
        default:'Active'
     },
     WalletAmount:{
        type:Number,
        default:0
     },
     walletTransactions:{
        type:Array,
     },
     usedCoupons:[{
        couponId:{type:Schema.Types.ObjectId},
        couponName:{type:String},
        couponcode:{type:String},
        count:{type:Number}
     }],
     userUuid:{
        type:String
     },
     wishlist:[{
        ProductId:{
         type:Schema.Types.ObjectId,
         ref:"Product"
        },
     }]
})

const user = mongoose.model("user" , Userschema)
module.exports = user