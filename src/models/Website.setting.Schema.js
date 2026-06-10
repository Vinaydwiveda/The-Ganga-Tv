const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
{
    websiteName:{
        type:String,
        default:"Ganga TV"
    },

    logo:{
        type:String
    },

    logoFileId:{
        type:String
    },

    banner:{
        type:String
    },

    bannerFileId:{
        type:String
    },

    footerText:{
        type:String
    },

    youtube:{
        type:String
    },

    facebook:{
        type:String
    },

    instagram:{
        type:String
    },

    linkedin:{
        type:String
    },

    twitter:{
        type:String
    }
},
{
    timestamps:true
}
);

module.exports = mongoose.model("Setting", settingSchema);