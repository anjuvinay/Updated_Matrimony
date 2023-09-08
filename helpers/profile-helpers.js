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


    getVerifiedProfiles1:(email)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:email})
             console.log(user)
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

    getMatchingProfiles:(user)=>{
        return new Promise(async(resolve,reject)=>{
            let userProfile=await db.get().collection(collection.PROFILE_COLLECTION).findOne({email:user.Email})

            if(user.Gender=="Male"){
                let matchedProfiles=await db.get().collection(collection.PROFILE_COLLECTION).aggregate([
                    {
                        $match:{
                            $and:[
                                {$or:[
                                    {caste:userProfile.ffcaste},
                                    {complexion:userProfile.ffcomplexion}

                                ]},
                                {gender:"Female"},
                                {age:{$gte:userProfile.ffage1, $lte:userProfile.ffage2}},
                                {height:{$gte:userProfile.ffheight1, $lte:userProfile.ffheight2}},
                                {religion:userProfile.ffreligion}
                            ]

                        }
                        
                    }
                ]).toArray()
                resolve(matchedProfiles)

            }else{
               let matchedProfiles =await db.get().collection(collection.PROFILE_COLLECTION).aggregate([
                {
                    $match:{
                        $and:[
                            {$or:[
                                {caste:userProfile.ffcaste},
                                {complexion:userProfile.ffcomplexion}

                            ]},
                            {gender:"Male"},
                            {age:{$gte:userProfile.ffage1, $lte:userProfile.ffage2}},
                            {height:{$gte:userProfile.ffheight1, $lte:userProfile.ffheight2}},
                            {religion:userProfile.ffreligion}
                        ]

                    }
                    
                }
               ]).toArray()
               resolve(matchedProfiles)
            }
         })
    },



    detailed_profile:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).updateOne({_id:new ObjectId(proId)},
            {
                $set:{
                    flag:"image1"
                }
            })
            let item =await db.get().collection(collection.PROFILE_COLLECTION).findOne({_id:new ObjectId(proId)})
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

    

    intrest_send:(data, userId, email)=>{
        return new Promise(async(resolve, reject)=>{
          let  proId=data.Id
          let reObj={
            
                    To:new ObjectId(proId),
                    Msg:data.comment,
                    Response:"Initiated",
                    Date:new Date()                                
                    }

          let sendObj={
                    From:new ObjectId(userId),
                    Msg:data.comment,
                    Response:"Initiated",
                    Date:new Date()                        
                       }          

            let sendProfile =await db.get().collection(collection.PROFILE_COLLECTION).findOne({_id:new ObjectId(proId)})
            let userProfile=await db.get().collection(collection.PROFILE_COLLECTION).findOne({email:email})

             db.get().collection(collection.INTEREST_RECEIVED_COLLECTION).insertOne(userProfile)

            db.get().collection(collection.INTEREST_SEND_COLLECTION).insertOne(sendProfile)

            await db.get().collection(collection.INTEREST_RECEIVED_COLLECTION).updateOne({_id:new ObjectId(userProfile._id)},
            {
                 $push:{receivedDetails:reObj}
            }
                )
      
            await db.get().collection(collection.INTEREST_SEND_COLLECTION).updateOne({_id:new ObjectId(proId)},
            {
                  $push:{sendDetails:sendObj}     
            }
                )

    let totalProfiles=await db.get().collection(collection.INTEREST_SEND_COLLECTION).aggregate([
                {
                  $match:{'sendDetails.From' :new ObjectId(userId)}
                },
                {
                    $unwind:'$sendDetails'
                },
                {
                    $match:{'sendDetails.From' :new ObjectId(userId)}
                }
             ]).sort({_id:-1}).toArray()
             
                resolve(totalProfiles)
         })
    },
          

    intrest:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let profiles= await db.get().collection(collection.INTEREST_SEND_COLLECTION).aggregate([
                {
                    $match:{'sendDetails.From' :new ObjectId(userId)}
                  },
                  {
                      $unwind:'$sendDetails'
                  },
                  {
                    $match:{'sendDetails.From' :new ObjectId(userId)}
                  }
               ]).sort({_id:-1}).toArray()
         resolve(profiles)
        })
    },

    interest_received:(email)=>{
        return new Promise(async(resolve,reject)=>{   
            let user=await db.get().collection(collection.PROFILE_COLLECTION).findOne({email:email})
             let profiles= await db.get().collection(collection.INTEREST_RECEIVED_COLLECTION).aggregate([
             {
                $match:{'receivedDetails.To' :new ObjectId(user._id)}
              },
              {
                   $unwind:'$receivedDetails'
                
              },
              {
                $match:{'receivedDetails.To' :new ObjectId(user._id)}
              },

           ]).sort({_id:-1}).toArray()
          resolve(profiles)
            
        })

    },

    interest_count:(email)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.PROFILE_COLLECTION).findOne({email:email})
            if(user){
            let profiles= await db.get().collection(collection.INTEREST_RECEIVED_COLLECTION)
            .find({'receivedDetails.To':new ObjectId(user._id)}).toArray()

            let count=0
            count=profiles.length
            resolve(count)
           }else{
            count=0
            resolve(count)

           }
         
        })
    },

    delete_intrest:(proId, userId, user)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.INTEREST_RECEIVED_COLLECTION).updateOne({email:user.Email},
            {
                $pull:{receivedDetails:{To:new ObjectId(proId)}}
            }
            )
            db.get().collection(collection.INTEREST_SEND_COLLECTION).updateOne({_id:new ObjectId(proId)},
            {
                $pull:{sendDetails:{From:new ObjectId(userId)}}
            }
            ).then((response)=>{
                resolve(response)
            })
                            
        })
    },

    myProfileDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).findOne({_id:new ObjectId(proId)}).then((profile)=>{
                resolve(profile)
            })
        })
    },

    updateProfile:(proId, proDetails)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).
            updateOne({_id:new ObjectId(proId)},{
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
                    email:proDetails.email,
                    ffage1:proDetails.ffage1,
                    ffage2:proDetails.ffage2,
                    ffheight1:proDetails.ffheight1,
                    ffheight2:proDetails.ffheight2,
                    ffreligion:proDetails.ffreligion,
                    ffcaste:proDetails.ffcaste,
                    ffcomplexion:proDetails.ffcomplexion,
                    fflanguage:proDetails.fflanguage,
                    ffdiet:proDetails.ffdiet,
                    ffEducation:proDetails.ffEducation,
                    ffjob:proDetails.ffjob,
                    fflocation:proDetails.fflocation,
                    ffmarital:proDetails.ffmarital,
                    ffphysical:proDetails.ffphysical
                }
            }).then((response)=>{
                resolve()
            })
        })
    },

    deleteProfile:(prodId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.PROFILE_COLLECTION).deleteOne({_id:new ObjectId(prodId)}).then((response)=>{
                resolve(response)
            })
        })
    },

    interestAccepted:(proId, email)=>{
        return new Promise(async(resolve, reject)=>{
            let userProfile=await db.get().collection(collection.PROFILE_COLLECTION).findOne({email:email})
            let person=await db.get().collection(collection.PROFILE_COLLECTION).findOne({_id:new ObjectId(proId)})
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({Email:person.email})

            
           await db.get().collection(collection.INTEREST_RECEIVED_COLLECTION)
           .updateOne({_id:new ObjectId(proId) ,'receivedDetails.To':new ObjectId(userProfile._id)},
              
            {
                $set:{
                    'receivedDetails.$.Response':"Accepted"
                     }
            }
            )  

            await db.get().collection(collection.INTEREST_SEND_COLLECTION)
            .updateOne({_id:new ObjectId(userProfile._id) ,'sendDetails.From':new ObjectId(user._id)},
            {
                $set:{
                    'sendDetails.$.Response': "Accepted"
                }
            }
            )
            resolve()  
        })
        
    },

    interestDeclined:(proId, email)=>{
        return new Promise(async(resolve, reject)=>{
            let userProfile=await db.get().collection(collection.PROFILE_COLLECTION).findOne({email:email})
            let person=await db.get().collection(collection.PROFILE_COLLECTION).findOne({_id:new ObjectId(proId)})
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({Email:person.email})

           await db.get().collection(collection.INTEREST_RECEIVED_COLLECTION)
           .updateOne({_id:new ObjectId(proId) , 'receivedDetails.To':new ObjectId(userProfile._id)},
              
            {
                $set:{
                    'receivedDetails.$.Response':"Declined"
                     }
            }
            )  

            await db.get().collection(collection.INTEREST_SEND_COLLECTION)
            .updateOne({_id:new ObjectId(userProfile._id) ,'sendDetails.From':new ObjectId(user._id)},
            {
                $set:{
                    'sendDetails.$.Response': "Declined"
                }
            }
            )
            resolve()  
        })
        
    },

    accepted_profiles:(email)=>{
        return new Promise(async(resolve,reject)=>{   
            let user=await db.get().collection(collection.PROFILE_COLLECTION).findOne({email:email})
             let profiles= await db.get().collection(collection.INTEREST_RECEIVED_COLLECTION).aggregate([
             {
                $match:{'receivedDetails.To' :new ObjectId(user._id)}
              },
              {
                   $unwind:'$receivedDetails'
                
              },
              {
                $match:{'receivedDetails.To' :new ObjectId(user._id), 'receivedDetails.Response' :"Accepted"}
              },

           ]).sort({_id:-1}).toArray()
          resolve(profiles)
            
        })

    },

    declined_profiles:(email)=>{
        return new Promise(async(resolve,reject)=>{   
            let user=await db.get().collection(collection.PROFILE_COLLECTION).findOne({email:email})
             let profiles= await db.get().collection(collection.INTEREST_RECEIVED_COLLECTION).aggregate([
             {
                $match:{'receivedDetails.To' :new ObjectId(user._id)}
              },
              {
                   $unwind:'$receivedDetails'
                
              },
              {
                $match:{'receivedDetails.To' :new ObjectId(user._id), 'receivedDetails.Response' :"Declined"}
              },

           ]).sort({_id:-1}).toArray()
          resolve(profiles)
            
        })

    },

    verifyMyProfile:(email)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.PROFILE_COLLECTION).findOne({email:email})
           
            if(user){
                resolve(user)
            }else{
                resolve(null)
            } 
               
        })
    }


}