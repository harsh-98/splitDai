import models from './../models'
import Sequelize from 'sequelize'
let Op = Sequelize.Op
import { createHashedPassword, getPicture } from './../helpers'

export const registerUser = (req, res) => {
    let validRole = ['tutor', 'student'];
    if (validRole.indexOf(req.params.role) == -1) {
        res.status(400).json({ message: 'Bad url' });
        return
    }

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
                username: req.body.username.trim(),
                email: req.body.email.trim(),
                role: req.params.role,
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
                    res.render('register', { userData: {role: req.params.role} })
                } else {
                    res.status(500).json({ message: 'Server error' })
                }
            }).catch(function (error) {
                res.status(400).json({ message: 'Bad request' });
            });
        }
    })
}
