var express = require('express');
var router = express.Router();
var profileHelpers=require('../helpers/profile-helpers')
const userHelpers=require('../helpers/user-helpers')
const adminHelpers=require('../helpers/admin-helpers');
const { response } = require('express');
const jwt = require('jsonwebtoken');
const { token } = require('morgan');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;



function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1]; 


  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    const userEmail = decoded.Email;
    req.userEmail = userEmail;
    const Id=decoded.userId; 
    req.Id = Id
    const userName=decoded.Name;
    req.userName = userName;

    next();
  });
}


/* GET home page. */
// router.get('/',verifyLogin, async function(req, res, next) {
//   let user=req.session.user
//   let interestCount=null 
//     interestCount=await profileHelpers.interest_count(user.Email)
  
//  profileHelpers.getVerifiedProfiles(user).then((profiles)=>{
 
//   res.render('user/view-profiles', {profiles,user,interestCount});
//  })
  
// }); 

router.get('/pro',verifyToken, async function(req, res, next) {
  const userEmail = req.userEmail;
  const userID = req.Id;
  const userName=req.userName
  
 profileHelpers.getVerifiedProfiles1(userEmail).then((profiles)=>{
  res.json({ "items":profiles}); 
    
 })
  
});

router.post('/create-profile', verifyToken, (req,res)=>{
profileHelpers.addProfile(req.body,(insertedId)=>{
  let image1=req.files.image1
  let image2=req.files.image2
  let image3=req.files.image3

  image3.mv('./public/profile-images/'+insertedId+3+'.jpg')
  image2.mv('./public/profile-images/'+insertedId+2+'.jpg') 
  image1.mv('./public/profile-images/'+insertedId+1+'.jpg',(err,done)=>{
    
    if(!err){
      console.log("No error")
    }else{
      console.log(err)
    }
  })
  
})
})




router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{

    if(response===null){
      res.json({ "result":false });
    }
    else{
      res.json({ "result":true });
    }
    
  })
  
})

router.post('/login',(req, res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status===true){ 
      res.json({ logged: true, token: response.token });
    }
    else{
      res.json({ logged: false });
    }
  })
})

router.get('/logout',(req,res)=>{
  res.json({ message: 'Logout successful' });
})

router.get('/view-profile/:id',verifyToken, (req,res)=>{
  let user=req.session.user
  profileHelpers.detailed_profile(req.params.id).then((profile)=>{
    res.render('user/view-Eprofile',{user,profile})
  })

})

router.get('/send-interest-button', verifyToken, (req,res)=>{
  let user=req.session.user
  profileHelpers.intrest(req.session.user._id).then((profiles)=>{
    console.log(profiles)
    res.render('user/send-intrest',{profiles,user})
  })

})

router.get('/interest', verifyToken, async(req,res)=>{
  let user=req.session.user
  let profile=await profileHelpers.verifyMyProfile(user.Email)
  if(profile){
    profileHelpers.interest_received(user.Email).then((profiles)=>{
      res.render('user/received-interest',{profiles,user})
      })
  }else{
    res.redirect('/create-profile')
  } 

  })


  router.get('/send-intrest/:id',verifyToken, async(req, res)=>{
    let user=req.session.user
    let proId=req.params.id
    let profile=await profileHelpers.verifyMyProfile(user.Email)
      console.log(profile)
      if(profile){
        res.render('user/interest-msg',{admin:false, user,proId})
      }else{
        res.redirect('/create-profile')
      } 
    
    })

    
  router.post('/int-msg', verifyToken, (req, res)=>{
      let user=req.session.user
      profileHelpers.intrest_send(req.body, req.session.user._id, user.Email).then((profiles)=>{
        res.redirect('/send-interest-button')
    })
  })
  

router.get('/cancel-intrest/:id', verifyToken, (req,res)=>{
  let user=req.session.user
  profileHelpers.delete_intrest(req.params.id, req.session.user._id,user)
    res.redirect('/send-interest-button')   
})


router.get('/my-profile',verifyToken,(req,res,next)=>{
  const userEmail = req.userEmail;
  profileHelpers.my_detailed_profile(userEmail).then((profile)=>{  
    res.json({ "items":profile}); 
  }) 
})


router.get('/edit-profile/:id',async(req,res)=>{
  let user=req.session.user
  let profile = await profileHelpers.myProfileDetails(req.params.id)
  console.log(profile)
  res.render('user/edit-profile',{profile,admin:false,user})
})


router.post('/edit-profile/:id',(req,res)=>{
  let insertedId=req.params.id
  profileHelpers.updateProfile(req.params.id, req.body).then(()=>{
    res.redirect('/my-profile')

    if(req.files && req.files.image1){
      
      let image1=req.files.image1
      image1.mv('./public/profile-images/'+insertedId+1+'.jpg') 
    }
    if(req.files && req.files.image2){
      let image2=req.files.image2
      image2.mv('./public/profile-images/'+insertedId+2+'.jpg')
    }
    if(req.files && req.files.image3){
      let image3=req.files.image3 
      image3.mv('./public/profile-images/'+insertedId+3+'.jpg')
    }

  })
  
})


router.get('/delete-profile/:id',(req,res)=>{
  let proId=req.params.id
  profileHelpers.deleteProfile(proId).then((response)=>{
    res.redirect('/')
  })
 
})


router.get('/matches', async(req,res)=>{
  let user=req.session.user
  let profile=await profileHelpers.verifyMyProfile(user.Email)
  if(profile){
    profileHelpers.getMatchingProfiles(user).then((profiles)=>{
      res.render('user/matching-profiles',{profiles, admin:false, user})
      })
  }else{
    res.redirect('/create-profile')
  } 
})

router.get('/accept-interest/:id', verifyToken, (req,res)=>{
  let user=req.session.user
  profileHelpers.interestAccepted(req.params.id, user.Email).then(()=>{
    res.json({status:true})  
  })
})

router.get('/decline-interest/:id', verifyToken, (req,res)=>{
  let user=req.session.user
  profileHelpers.interestDeclined(req.params.id, user.Email).then(()=>{
    res.json({status:true})  
  })
})

router.get('/accepted-interest', verifyToken, async(req,res)=>{
  let user=req.session.user
  let profiles=await profileHelpers.accepted_profiles(user.Email)
  res.render('user/accepted-interest',{user, profiles})
})

router.get('/declined-interest', verifyToken, async(req,res)=>{
  let user=req.session.user
  let profiles=await profileHelpers.declined_profiles(user.Email)
  res.render('user/declined-interest',{user,profiles}) 
})




module.exports = router;
