var express = require('express');
var router = express.Router();
var profileHelpers=require('../helpers/profile-helpers')
const userHelpers=require('../helpers/user-helpers')
const adminHelpers=require('../helpers/admin-helpers')
const jwt = require('jsonwebtoken');
const { token } = require('morgan');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

function verifyyToken(req, res, next) {
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

/* GET users listing. */
router.get('/list',verifyyToken, function(req, res, next) { 
  
  profileHelpers.getAllProfiles().then((profiles)=>{
    res.json({ "items":profiles}); 
  }) 
});

  
  router.post('/sign-up', function(req, res){
    adminHelpers.doSign_up(req.body).then((response)=>{
      if(response===null){
        res.json({ "result":false });
      }
      else{
        res.json({ "result":true });
      } 
    })
   })

  
   router.post('/log-in',(req, res)=>{  
    adminHelpers.doLog_in(req.body).then((response)=>{  
      if(response.status===true){ 
        res.json({ logged: true, token: response.token });
      }
      else{
        res.json({ logged: false });
      }  
  })
  })
  

  router.get('/verify-status/:id',(req,res)=>{
    adminHelpers.verifiedStatus(req.params.id).then(()=>{
      res.json({status:true})  
    })
  })
  

module.exports = router;
