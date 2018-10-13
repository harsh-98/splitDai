import passportLocal from 'passport-local'
import passportFacebook from 'passport-facebook'
import Sequelize from 'sequelize'
let Op = Sequelize.Op
import models from './../models'
import { getPicture } from './../helpers'
import passportGoogle from 'passport-google-oauth'
// import axios from 'axios'


import dotenv from 'dotenv'
dotenv.config()



module.exports = function (User, passport) {
    let LocalStrategy = passportLocal.Strategy;
    let GoogleStrategy = passportGoogle.OAuth2Strategy;
    let FacebookStrategy = passportFacebook.Strategy;

    passport.serializeUser(function (user, done) {
        let res = user[1]
        user = user[0]
        console.log('searialUser')

        let data = {
            id: user.id,
            name: user.firstname + ' ' + user.lastname,
            username: user.username
        }
        const createUser = userClient.createUser({
            userId: `user-${data.id}`,
            userLocators: [],
            systemUser: false,
            screenName: {
                screenName: data.name
            }
        }).catch((e) => {
            done(e, null);
            if (!(e.response.status === 409 && e.response.data.errorCode === 'duplicate_entity')) {
                throw e
            }
        })
        done(null, data);

    });

    passport.deserializeUser(function (key, done) {
        // console.log(key)
        User.findById(key.id).then(function (user) {
            console.log('desearialUser')
            if (user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            }
        });
    });

    passport.use(new FacebookStrategy({
        clientID: process.env.facebook_api_key,
        clientSecret: process.env.facebook_api_secret,
        passReqToCallback: true,
        callbackURL: `${process.env.website}/auth/facebook/callback`,
        profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name']
    },
        function (req, accessToken, refreshToken, profile, done) {
            console.log(profile)
            let role = req.cookies.role
            let gender = profile.gender
            gender = gender ?gender : "male"
            let email = profile.emails[0].value
            let obj = {
                firstname: profile.name.givenName,
                lastname: profile.name.familyName,
                username: profile.id,
                email: email,
                role: role ? role : "student",
                password: profile.provider,
                gender: gender ? gender : "male",
                pic: getPicture(gender)
            }
            console.log(obj)
            User.findOrCreate({
                where: {
                    email: email
                },
                defaults: obj
            }).spread(function (userResult, created) {
                console.log(userResult, created)
                console.log("userResult, created")
                if (!userResult) { return done(null); }
                done(null, userResult);
            })
        }
    ));

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        passReqToCallback: true,
        callbackURL: `${process.env.website}/auth/google/callback`
    },
        function (req, accessToken, refreshToken, profile, done) {
            console.log(profile)
            let role = req.cookies.role
            let gender = profile.gender
            let email = profile.emails[0].value
            email ? email : profile.id + '@gmail.com'
            let obj = {
                firstname: profile.name.givenName,
                lastname: profile.name.familyName,
                username: profile.id.toString(),
                email: email,
                role: role,
                password: profile.provider,
                gender: gender ? gender : "male",
                pic: profile.photos[0].value
            }
            console.log(obj)
            User.findOrCreate({
                where: {
                    email: email
                },
                defaults: obj
            }).spread(function (userResult, created) {
                if (!userResult) { return done(null); }
                done(null, userResult);
            })
        }
    ));

    passport.use('local-login', new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, username, password, done) {
            User.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                        { email: username }
                    ]
                }
            }).then(function (user) {
                if (!user) {
                    return done(null, false, { message: "User doesn't exist" });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            });
        })
    );

}
