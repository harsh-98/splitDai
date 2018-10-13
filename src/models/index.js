import Sequelize from 'sequelize'
import path from 'path'
import fs from 'fs'
let env = process.env.NODE_ENV || "development";
let config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
let sequelize = new Sequelize(config.database, config.username, config.password, config);


let db = {};

let arr = ['index.js', 'post.js', 'reply.js', 'token.js', 'comment.js']

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        // return (file.indexOf(".") !== 0) && (file !== "index.js");
        return (file.indexOf(".") !== 0) && (arr.indexOf(file) == -1);
    })
    .forEach(function(file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db
