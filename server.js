
const app = require('./src/app.js')
const db = require('./src/confid/db.config.js')



async function start(){
    await db();
   app.listen(process.env.PORT,()=>{
    console.log(`Server listening on ${process.env.PORT}` )
})    
}


start().catch(err=>{console.log(err)})  
    
