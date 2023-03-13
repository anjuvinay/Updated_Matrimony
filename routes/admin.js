var express = require('express');
var router = express.Router();
var profileHelpers=require('../helpers/profile-helpers')
const userHelpers=require('../helpers/user-helpers')
const adminHelpers=require('../helpers/admin-helpers')

const verifyLogiin = (req, res, next)=>{
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin/log-in')
  }
}

/* GET users listing. */
router.get('/',verifyLogiin, function(req, res, next) { 
  let Admin=req.session.admin
  profileHelpers.getAllProfiles().then((profiles)=>{
    res.render('admin/view-profiles',{admin:true,Admin, profiles});
  }) 
});

router.get('/sign-up', function(req, res){
  res.render('admin/sign-up',{admin:true})
  })
  
  router.post('/sign-up', function(req, res){
    adminHelpers.doSign_up(req.body).then((response)=>{
     req.session.admin=response
     req.session.admin.loggedIn=true    
      res.redirect('/admin')
     
    })
   })

   router.get('/log-in',(req,res)=>{
    if(req.session.admin){
      res.redirect('/')
    }else{
      res.render('admin/log-in',{"loginErr":req.session.loginErr,admin:true})
      req.session.loginErr=false
    }
   })
  
   router.post('/log-in',(req, res)=>{  
    adminHelpers.doLog_in(req.body).then((response)=>{  
      if(response.status){ 
        req.session.admin=response.admin
        req.session.admin.loggedIn=true
       
    res.redirect('/admin')
      }else{
        req.session.loginErr="Invalid username or Password"
        res.redirect('/admin/log-in')
      }
     
  })
  })
  
  router.get('/log-out',(req,res)=>{
    req.session.admin=null
    req.session.adminLoggedIn=false
    res.redirect('/admin/log-in')
  })

  router.get('/verify-status/:id',(req,res)=>{
    adminHelpers.verifiedStatus(req.params.id).then(()=>{
      console.log(req.params.id)
      res.redirect('/admin')
    })
  })
  

module.exports = router;
