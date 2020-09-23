const router = require('express').Router();
const axios = require('axios')
const User = require('../model/user');
const jwt = require('jsonwebtoken');

//login verification function
async function verifyLogin(loginFrom, token) {
    try {
        if (loginFrom == 'facebook') {
            const response = await axios.get(`https://graph.facebook.com/v2.12/me?fields=name,first_name,last_name,email,picture&access_token=${token}`)
            const userInfo = {
                name: response.data.name,
                email: response.data.email,
                imageUrl: response.data.picture.data.url,
            }
            response.data.picture = response.data.picture.data.url;
            return userInfo
        } else {
            const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
            const userInfo = {
                name: response.data.name,
                email: response.data.email,
                imageUrl: response.data.picture,
            }
            return userInfo
        }
    } catch (error) {
        return null
    }
}

//login api
router.post('/login', async (req, res) => {
    //check login type facebook or google
    verifyLogin(req.body.loginFrom, req.body.token).then(async (userInfo) => {
        if (userInfo == null) {
            res.send({ error: true, message: "Something went wrong" })
        } else {
            //check if account already exists
            const userExists = await User.findOne({ email: userInfo.email, loginFrom: req.body.loginFrom });
            if (userExists) {
                const token = jwt.sign({ _id: userExists._id }, process.env.TOKEN_SECRET);
                return res.header('auth-token', token).send({error:false, token: token,userData: userExists});
            }

            //Crate new user
            const user = new User({
                email: userInfo.email,
                name: userInfo.name,
                imgUri: userInfo.imageUrl,
                loginFrom: req.body.loginFrom
            })
            
            try {
                const savedUser = await user.save()
                const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
                return res.header('auth-token', token).send({error:false, token: token, userData: user});
            } catch (error) {
                res.send({ error: true, message: error});
            }

        }
    })

    //check if account already exists



})



module.exports = router;