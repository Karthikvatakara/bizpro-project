const mongoose = require('mongoose')

const BannerSchema = mongoose.Schema({

    BannerName:{
        type:String,
    },
    Image:{
        type:String
    },
    Status:{
        type:String,
        default:'Disabled'
    },
    carosel:{
        type:Array
    },
    Date:{type:Date}
})

const Banner = mongoose.model('banner',BannerSchema)

module.exports = Banner