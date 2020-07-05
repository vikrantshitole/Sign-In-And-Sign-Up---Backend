const express = require('express');
const router = express.Router();

const AuthCtrl = require('../Controllers/auth');
// Routes of Backend 
router.post('/register', AuthCtrl.createUser);
router.post('/login', AuthCtrl.loginUser);
router.get('/forget/:username', AuthCtrl.findUser);
router.put('/change/:username', AuthCtrl.changePassword);

module.exports = router;
