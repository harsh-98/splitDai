// import express from 'express'
// import passport from 'passport'

// let router = express.Router();

import bcrypt from 'bcryptjs'
// import tutor from './tutor'
// import student from './student'
import { index, registerUser, register, dashboard, profile, addCourse, registerCourse, courseList, searchCourseTemplate } from './../controllers'
import { whiteboard, discussion, addCourseTemplate, registerCourseTemplate, comingSoon } from './../controllers/ajax'

module.exports = function (app, passport) {

    app.get('/', index)


    // facebook oauth

    app.get('/auth/facebook', passport.authenticate('facebook'))

    app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }))

    app.get('/auth/google/callback', function (req, res, next) {
        passport.authenticate('google', function (err, user, info) {
            console.log("callack google")
            if (!user) { res.redirect(`/register`); }
            if (user)
                // req.logIn(user, function (err) {
                req.logIn([user, res], function (err) {
                    res.cookie('UserId', user.id)
                    res.cookie('recipient', user.token)
                    res.redirect(`/dashboard`);
                })
        })(req, res, next)
    })

    app.get('/auth/facebook/callback', function (req, res, next) {
        passport.authenticate('facebook', function (err, user, info) {
            console.log("callack facebook")
            if (!user) { res.redirect(`/register`); }
            if (user)
                // req.logIn(user, function (err) {
                req.logIn([user, res], function (err) {
                    res.cookie('UserId', user.id)
                    res.cookie('recipient', user.token)
                    res.redirect(`/dashboard`);
                })
        })(req, res, next)
    })

    app.get('/register', register)
    app.post('/register', registerUser)
    app.get('/dashboard', dashboard)

    app.post('/login', function (req, res, next) {

        passport.authenticate('local-login', function (err, user, info) {
            if (!user) { res.redirect(`/register`); }
            if (user)
                req.logIn([user, res], function (err) {
                    // req.logIn(user, function (err) {
                    res.cookie('UserId', user.id)
                    res.redirect(`/profile`);
                })
        })(req, res, next)
    })



    app.get('/logout', function (req, res) {
        res.redirect(`/register`);
    });

}

