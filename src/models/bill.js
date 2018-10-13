export default function(sequelize, Sequelize) {

    var Bill = sequelize.define('Bill', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
    });

    Bill.associate = function (models) {
        Bill.belongsToMany(models.User,{
            as: 'pariticipants',
            through: 'userBill'
        })
    }
    return Bill;
}


