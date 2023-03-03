var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')

/* GET home page. */
router.get('/', function(req, res, next) {
 productHelpers.getAllProfiles().then((profiles)=>{
  res.render('user/view-profiles', {profiles,admin:false});
 })
  
});

router.get('/create-profile', function(req, res, next){
  res.render('user/add-profile', {admin:false});
})

router.post('/create-profile', (req,res)=>{
productHelpers.addProfile(req.body,(insertedId)=>{
  let image=req.files.image
     
  image.mv('./public/profile-images/'+insertedId+'.jpg',(err,done)=>{
    
    if(!err){
      res.redirect('/')
    }else{
      console.log(err)
    }
  })
  
})
})

module.exports = router;
