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


router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

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
router.get('/count', verifyToken, async function(req, res, next) {
  let interestCount=null 
    interestCount=await profileHelpers.interest_count(req.userEmail)
    res.json({ "items":interestCount});  
}); 

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

const uploadImage = (file, index) => {
  if (file) {
    const filename = `./public/profile-images/${insertedId}${index}.jpg`;
    file.mv(filename, (err) => {
      if (err) {
        console.error(`Error uploading image ${index}: ${err}`);
      } else {
        console.log(`Image ${index} uploaded successfully`);
      }
    });
  }
};

uploadImage(req.files?.image1, 1);
uploadImage(req.files?.image2, 2);
uploadImage(req.files?.image3, 3);

res.json({ message: 'Profile created successfully' });
});
});




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


router.get('/view-profile/:id',verifyToken, (req,res)=>{ 
  profileHelpers.detailed_profile(req.params.id).then((profile)=>{
    res.json({ "items":profile});
  })

})

router.get('/send-interest-button', verifyToken, (req,res)=>{
  profileHelpers.intrest(req.Id).then((profiles)=>{
    res.json({ "items":profiles});
  })

})

router.get('/interest', verifyToken, async(req,res)=>{
  let profile=await profileHelpers.verifyMyProfile(req.userEmail)
  if(profile){
    profileHelpers.interest_received(req.userEmail).then((profiles)=>{
      res.json({ "items":profiles});
      })
  }else{
    res.json({ "items":null});
  } 

  })


  // router.get('/send-intrest/:id',verifyToken, async(req, res)=>{
  //   let user=req.session.user
  //   let proId=req.params.id
  //   let profile=await profileHelpers.verifyMyProfile(user.Email)
  //     console.log(profile)
  //     if(profile){
  //       res.render('user/interest-msg',{admin:false, user,proId})
  //     }else{
  //       res.redirect('/create-profile')
  //     } 
    
  //   })

    

  router.post('/int-msg/:id', verifyToken, async(req, res)=>{
    const userEmail = req.userEmail; 
    await profileHelpers.intrest_send(req.body, req.params.id, req.Id, userEmail).then((profiles)=>{
      res.json({ "sendInterest":true });
  })
})
  

router.get('/cancel-intrest/:id', verifyToken, (req,res)=>{
  profileHelpers.delete_intrest(req.params.id, req.Id, req.userEmail).then((response)=>{
    res.json({ "deleteInterest":true });
  }) 
})


router.get('/my-profile',verifyToken,(req,res,next)=>{
  const userEmail = req.userEmail;
  profileHelpers.my_detailed_profile(userEmail).then((profile)=>{  
    res.json({ "items":profile}); 
  }) 
})


router.get('/edit-profile',verifyToken,async(req,res)=>{
  let profile = await profileHelpers.myProfileDetails(req.userEmail)
  res.json({ "items":profile}); 
})


router.post('/edit-profile',verifyToken,async(req,res)=>{
  
  await profileHelpers.updateProfile(req.userEmail, req.body).then((insertedId)=>{

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
  res.json({ editted: true });  
})


router.get('/delete-profile', verifyToken,(req,res)=>{
  profileHelpers.deleteProfile(req.userEmail).then((response)=>{
    res.json({ deleted: true }); 
  })
 
})


router.get('/matches', verifyToken, async(req,res)=>{
  let profile=await profileHelpers.verifyMyProfile(req.userEmail)
  if(profile){
    profileHelpers.getMatchingProfiles(req.userEmail).then((profiles)=>{
      res.json({ "items":profiles});
    })
}else{
  res.json({ "items":null});
} 
})

router.get('/accept-interest/:id', verifyToken, (req,res)=>{
  profileHelpers.interestAccepted(req.params.id, req.userEmail).then(()=>{
    res.json({status:true})  
  })
})

router.get('/decline-interest/:id', verifyToken, (req,res)=>{
  
  profileHelpers.interestDeclined(req.params.id, req.userEmail).then(()=>{
    res.json({status:true})  
  })
})

router.get('/accepted-interest', verifyToken, async(req,res)=>{
  let profiles=await profileHelpers.accepted_profiles(req.userEmail)
  res.json({ "items":profiles}); 
})

router.get('/declined-interest', verifyToken, async(req,res)=>{
  let profiles=await profileHelpers.declined_profiles(req.userEmail)
  res.json({ "items":profiles}); 
})




module.exports = router;
