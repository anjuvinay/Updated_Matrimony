var express = require('express');
var router = express.Router();
var profileHelpers=require('../helpers/profile-helpers')
const userHelpers=require('../helpers/user-helpers')
const adminHelpers=require('../helpers/admin-helpers');
const { response } = require('express');

const verifyLogin = (req, res, next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',verifyLogin, async function(req, res, next) {
  let user=req.session.user
  let interestCount=null 
    interestCount=await profileHelpers.interest_count(user.Email)
  
 profileHelpers.getVerifiedProfiles(user).then((profiles)=>{
 
  res.render('user/view-profiles', {profiles,user,interestCount});
 })
  
});

router.get('/create-profile', function(req, res, next){
  let user=req.session.user
  res.render('user/add-profile', {admin:false, user});
})

router.post('/create-profile',verifyLogin, (req,res)=>{
profileHelpers.addProfile(req.body,(insertedId)=>{
  let image1=req.files.image1
  let image2=req.files.image2
  let image3=req.files.image3

  image3.mv('./public/profile-images/'+insertedId+3+'.jpg')
  image2.mv('./public/profile-images/'+insertedId+2+'.jpg') 
  image1.mv('./public/profile-images/'+insertedId+1+'.jpg',(err,done)=>{
    
    if(!err){
      res.redirect('/')
    }else{
      console.log(err)
    }
  })
  
})
})

router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else
  res.render('user/login',{"loginErr":req.session.loginErr})
  req.session.loginErr=false
})

router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response)
    req.session.user=response
    req.session.user.loggedIn=true
    res.redirect('/')
  })
  
})

router.post('/login',(req, res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){ 
      req.session.user=response.user
      req.session.user.loggedIn=true
      console.log(req.session.user)
      res.redirect('/')
    }else{
      req.session.loginErr="Invalid username or Password"
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/view-profile/:id',verifyLogin, (req,res)=>{
  let user=req.session.user
  profileHelpers.detailed_profile(req.params.id).then((profile)=>{
    res.render('user/view-Eprofile',{user,profile})
  })

})

router.get('/send-interest-button', verifyLogin, (req,res)=>{
  let user=req.session.user
  profileHelpers.intrest(req.session.user._id).then((profiles)=>{
    res.render('user/send-intrest',{profiles,user})
  })

})

router.get('/interest', verifyLogin, (req,res)=>{
  let user=req.session.user
  profileHelpers.interest_received(user.Email).then((profiles)=>{
    res.render('user/received-interest',{profiles,user})
    })

  })

  router.get('/received-interest',verifyLogin, (req,res)=>{
    let user=req.session.user
    profileHelpers.interest_received(user.Email).then((profiles)=>{
      res.render('user/received-intrest',{profiles,user})
    })
  
  })
  

  router.get('/send-intrest/:id',verifyLogin, (req, res)=>{
    let user=req.session.user
    profileHelpers.intrest_send(req.params.id, req.session.user._id, user.Email).then((profiles)=>{
      res.render('user/send-intrest',{profiles,user})
    })
   
  })
  

router.get('/cancel-intrest/:id', verifyLogin, (req,res)=>{
  let user=req.session.user
  profileHelpers.delete_intrest(req.params.id).then((response)=>{
    res.redirect('/interest')
  })  
})


router.get('/my-profile',verifyLogin,(req,res,next)=>{
  let user=req.session.user
  profileHelpers.my_detailed_profile(user.Email).then((profile)=>{  
  res.render('user/my-profile', {profile,admin:false, user}) 
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

    if(req.files.image1){
      
      let image1=req.files.image1
      image1.mv('./public/profile-images/'+insertedId+1+'.jpg') 
    }
    if(req.files.image2){
      let image2=req.files.image2
      image2.mv('./public/profile-images/'+insertedId+2+'.jpg')
    }
    if(req.files.image3){
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

router.get('/change-image2/:id',verifyLogin, (req,res)=>{
  profileHelpers.imageStatus(req.params.id).then(()=>{
   res.json(response)
  }) 
})

router.get('/change-image3/:id',verifyLogin, (req,res)=>{
  profileHelpers.imageStatus3(req.params.id).then(()=>{
   res.json(response)
  }) 
})

router.get('/change-image1/:id',verifyLogin, (req,res)=>{
  profileHelpers.imageStatus1(req.params.id).then(()=>{
   res.json(response)
  }) 
})


module.exports = router;
