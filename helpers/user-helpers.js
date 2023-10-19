var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var ObjectId = require('mongodb').ObjectId
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;


module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
            const existingUser = await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})

            if (existingUser) {
            resolve(null)
            }else{
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(userData)
            })
        }

        })

    },

    doLogin:(userData)=>{
        return new Promise(async(resolve, reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            
            if(user){
                bcrypt.compare(userData.Password, user.Password).then((status)=>{
                    if(status){      
                      const token = jwt.sign({ userId:user._id,Email:userData.Email,Name:user.Name }, JWT_SECRET_KEY, { expiresIn: '1h' });
                      console.log("Login Success");
                      resolve({ status: true, token });   
                    } else { 
                       console.log("Login Failed");    
                       resolve({ status: false });
                    }
   
                })

            }else{
                console.log("Login failed no user")
                resolve({status:false})
            }
        })
    }
}