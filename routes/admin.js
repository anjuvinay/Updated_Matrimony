var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) { 
  productHelpers.getAllProfiles().then((profiles)=>{
    res.render('admin/view-profiles',{admin:true, profiles});
  }) 
});

module.exports = router;
