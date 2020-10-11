
const express = require('express');
const secured = require('../middleware/secured');
const router = express.Router();

/* GET user profile. */
router.get('/user', secured(), function (req, res, next) {
  const { _raw, _json, ...userProfile } = req.user;
  res.send({
    userProfile: userProfile,
    title: 'Profile page'
  });
});

module.exports = router;