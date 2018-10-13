export default function(sequelize, Sequelize) {

    var group = sequelize.define('Group', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        name: {
            type: Sequelize.STRING,
            notEmpty: true
        },
    });

    group.associate = function (models) {
    }
    return group;
}


