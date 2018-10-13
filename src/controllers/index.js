import models from './../models'
import Sequelize from 'sequelize'
let Op = Sequelize.Op
import { createHashedPassword, getPicture } from './../helpers'


export const register = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect(`/dashboard`)
    } else {
        res.render('register', { userData: {} })
    }
}

export const dashboard = (req, res) => {
    if (req.isAuthenticated()) {
        res.render('dashboard', { userData: {} })
    } else {
        res.redirect(`/register`)
    }
}

export const index = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect(`/dashboard`)

    } else {
        res.redirect("/register")
    }
}

export const registerUser = (req, res) => {
    models.User.findOne({
        where: {
            email: req.body.email,
        }
    }).then(function (user) {
        if (user) {
            res.status(400).json({ message: 'That email is already taken' })
        } else {
            let hash = createHashedPassword(req.body.password);



            let trimedObject = {
                firstname: req.body.firstname.trim(),
                lastname: req.body.lastname.trim(),
                email: req.body.email.trim(),
                password: hash,
                gender: req.body.gender,
                pic: getPicture(req.body.gender)
            }

            if (req.body.password == req.body.passwordCon) {
            }
            else {
                res.status(400).json({ message: 'password don\'t match.' })
                return
            }

            models.User.create(trimedObject).then(function (newUser, created) {
                if (newUser) {
                    // res.status(201).json({ message: 'User created' })
                    res.render('register', { userData: {} })
                } else {
                    res.status(500).json({ message: 'Server error' })
                }
            }).catch(function (error) {
                res.status(400).json({ message: 'Bad request' });
            });
        }
    })
}
