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

    getVerifiedProfiles:(user)=>{
        console.log(user)
             return new Promise(async(resolve,reject)=>{

                if(user.Gender=="Male"){
                    let VerifiedProfiles=await db.get().collection(collection.PROFILE_COLLECTION)
                    .find({email:{$nin:[user.Email]},status:"Verified",gender:"Female"}).toArray()
                     resolve(VerifiedProfiles)

                }else{
                 let VerifiedProfiles=await db.get().collection(collection.PROFILE_COLLECTION)
                .find({email:{$nin:[user.Email]},status:"Verified",gender:"Male"}).toArray()
                 resolve(VerifiedProfiles)
                }
             })
         },

    detailed_profile:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).updateOne({_id:ObjectId(proId)},
            {
                $set:{
                    flag:"image1"
                }
            })
            let item =await db.get().collection(collection.PROFILE_COLLECTION).findOne({_id:ObjectId(proId)})
                resolve(item)
            
        })
    },

    my_detailed_profile:(email)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).updateOne({email:email},
            {
                $set:{
                    flag:"image1"
                }
            })
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
    },

    myProfileDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).findOne({_id:ObjectId(proId)}).then((profile)=>{
                resolve(profile)
            })
        })
    },

    updateProfile:(proId, proDetails)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).
            updateOne({_id:ObjectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    age:proDetails.age,
                    gender:proDetails.gender,
                    DOB:proDetails.DOB,
                    height:proDetails.height,
                    weight:proDetails.weight,
                    complexion:proDetails.complexion,
                    physical:proDetails.physical,
                    language:proDetails.language,
                    location:proDetails.location,
                    marital:proDetails.marital,
                    diet:proDetails.diet,
                    religion:proDetails.religion,
                    caste:proDetails.caste,
                    Education:proDetails.Education,
                    job:proDetails.job,
                    mobile:proDetails.mobile,
                    email:proDetails.email
                }
            }).then((response)=>{
                resolve()
            })
        })
    },

    deleteProfile:(prodId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).deleteOne({_id:ObjectId(prodId)}).then((response)=>{
                resolve(response)
            })
        })
    },

    imageStatus:(proId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).updateOne({_id:ObjectId(proId)},
            {
                $set:{
                    flag:"image2"
                }
            }).then(()=>{
                resolve()
            })
        })
    },

    imageStatus3:(proId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).updateOne({_id:ObjectId(proId)},
            {
                $set:{
                    flag:"image3"
                }
            }).then(()=>{
                resolve()
            })
        })
    },

    imageStatus1:(proId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).updateOne({_id:ObjectId(proId)},
            {
                $set:{
                    flag:"image1"
                }
            }).then(()=>{
                resolve()
            })
        })
    }

}