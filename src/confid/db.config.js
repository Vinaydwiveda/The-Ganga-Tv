const mongoose = require('mongoose')

 const db = async()=>{
    
   await mongoose.connect(process.env.DB_URI).then(()=>{
    console.log('db connected sucessfully ')
}).catch((err)=>{
    console.log(err)
    process.exit(0)
})
}


module.exports = db 