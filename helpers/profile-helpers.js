var db=require('../config/connection')
var collection=require('../config/collections')
const { response } = require('express')
var ObjectId = require('mongodb').ObjectId


module.exports={

    addProfile:(details, callback)=>{
        db.get().collection('profile').insertOne(details).then((data)=>{
            callback(data.insertedId)
        })

    },

    addMyProfile:(details, callback)=>{
        db.get().collection(collection.MYPROFILE_COLLECTION).insertOne(details).then((data)=>{
            callback(data.insertedId)
        })
    },

    getAllProfiles:()=>{
        return new Promise(async(resolve, reject)=>{
            let profiles=await db.get().collection(collection.PROFILE_COLLECTION).find().toArray()
            resolve(profiles)
        })
    },

    // getVerifiedProfiles:()=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let VerifiedProfiles=await db.get().collection(collection.PROFILE_COLLECTION)
    //         .find({status:"Verified"}).toArray()
    //         resolve(VerifiedProfiles)
    //     })
    // },

    getVerifiedProfiles:()=>{
             return new Promise(async(resolve,reject)=>{
                 let VerifiedProfiles=await db.get().collection(collection.PROFILE_COLLECTION)
                .find({religion:{$nin:["Hindu"]},status:"Verified"}).toArray()
                 resolve(VerifiedProfiles)
             })
         },

    detailed_profile:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            let item =await db.get().collection(collection.PROFILE_COLLECTION).findOne({_id:ObjectId(proId)})
                resolve(item)
            
        })
    },

    my_detailed_profile:(email)=>{
        return new Promise(async(resolve,reject)=>{
            let profile=await db.get().collection(collection.PROFILE_COLLECTION).findOne({email:email})
            console.log(profile)
            resolve(profile)
        })

    },

    intrest_send:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            let item =await db.get().collection(collection.PROFILE_COLLECTION).findOne({_id:ObjectId(proId)})
         db.get().collection(collection.INTEREST_SEND_COLLECTION).insertOne(item)

         let profiles= await db.get().collection(collection.INTEREST_SEND_COLLECTION).find().sort({_id:-1}).toArray() 
         resolve(profiles)
        
        })

    },

    intrest:()=>{
        return new Promise(async(resolve,reject)=>{
            let profiles= await db.get().collection(collection.INTEREST_SEND_COLLECTION).find().toArray()
         resolve(profiles)
        })
    },

    interest_count:()=>{
        return new Promise(async(resolve,reject)=>{
            let profiles= await db.get().collection(collection.INTEREST_SEND_COLLECTION).find().toArray()
            let count=0
            count=profiles.length
         resolve(count)
        })
    },

    delete_intrest:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.INTEREST_SEND_COLLECTION).deleteOne({_id:ObjectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    }

}