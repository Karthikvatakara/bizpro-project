const mongoose = require('mongoose')
const { Schema, model } = mongoose;

const shipAddressSchema = new Schema({
    Name: {
        type: String,
        required: true,
    },
    AddressLane: {
        type: String,
        required: true,
    },
    City: {
        type: String,
        required: true,
    },
    Pincode: {
        type: Number,
        required: true,
    },
    State: {
        type: String,
        required: true,
    },
    Mobile: {
        type: Number,
        required: true
    }
});

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'user'
    },
    Status: {
        type: String,
        default: "Order Placed"
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product"
        },
        name:{
            type:String
        },
        price:{
            type:Number
        },
        Quantity: {
            type: Number
        }
    }],
    PaymentMethod: {
        type: String
    },
    OrderDate: {
        type: Date,
        default: Date.now  // Set default value to the current date
    },
    TotalPrice: {
        type: Number
    },
    PaymentStatus: {
        type: String,
        default: "pending"
    },
    CouponId: {
        type: Schema.Types.ObjectId
    },
    Address: {
        type: shipAddressSchema,
        required: true
    },
    ExpectedDeliveryDate: {
        type: Date // Adjusted to Date type for better handling
    },
    returnReason:{
        type: String
    },
    coupon:{
        couponname:{
            type:String
        },
        couponcode:{
            type:String
        },
        discountAmount:{
            type:Number
        }
    },
    orderUuid:{
        type:String
    },
    isMultiplePayment:{
        isMultiple:{
            type:Boolean,
            default:false
        },
        Amount:{
            type:Number,
            default:0,
        }
    },

});

const Order = model('Order', orderSchema); 

module.exports = Order;
