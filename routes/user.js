var express = require('express');
var router = express.Router();
var profileHelpers=require('../helpers/profile-helpers')
const userHelpers=require('../helpers/user-helpers')
const adminHelpers=require('../helpers/admin-helpers')

const verifyLogin = (req, res, next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  let user=req.session.user
 profileHelpers.getVerifiedProfiles().then((profiles)=>{
  res.render('user/view-profiles', {profiles,user});
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
  })
  
})

router.post('/login',(req, res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){ 
      req.session.user=response.user
      req.session.user.loggedIn=true
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

router.get('/interest', verifyLogin, (req,res)=>{
  let user=req.session.user
  profileHelpers.intrest().then((profiles)=>{
    res.render('user/send-intrest',{profiles,user})
  })

})

router.get('/send-intrest/:id',verifyLogin, (req, res)=>{
  let user=req.session.user
  profileHelpers.intrest_send(req.params.id).then((profiles)=>{
    console.log(profiles)
    res.render('user/send-intrest',{profiles,user})
  })
 
})

module.exports = router;
