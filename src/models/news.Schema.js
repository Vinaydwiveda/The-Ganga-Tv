const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
{
    title:{
        type:String,
        required:true,
        trim:true
    },

    summary:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },

  category:{
  type:String,
  enum:[
    "politics",
    "sports",
    "business",
    "technology",
    "education",
    "health",
    "entertainment",
    "local",
    "national",
    "international"
  ],
  required:true
},

    thumbnail:{
        type:String
    },

    // ImageKit file id
    thumbnailFileId:{
        type:String
    },

    tags:[
        {
            type:String
        }
    ],

    status:{
        type:String,
        enum:["draft","published","rejected"],
        default:"draft"
    },

    editor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    publishedAt:{
        type:Date
    }
},
{
    timestamps:true
}
);

newsSchema.pre("save", function() {
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model("News", newsSchema);