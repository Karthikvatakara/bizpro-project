const mongoose = require('mongoose')

const bannerschema = mongoose.Schema({

    BannerName:{
        type:String,
    },
    Image:{
        type:String
    },
    status:{
        type:String,
        required:true
    }
})

const banner = mongoose.model('banner',bannerschema)

module.exports = brand