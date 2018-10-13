import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import exphbs from 'express-handlebars'
import session from 'express-session'
import ioCookieParser from 'socket.io-cookie-parser'
import passport from 'passport'
import models from './src/models'
// import routes from './src/routes'




//Sync Database
models.sequelize.sync().then(function() {
// models.sequelize.sync({force : true}).then(function() {

    console.log('Nice! Database looks fine')

}).catch(function(err) {
    console.log(err, "Something went wrong with the Database Update!")
});


let options = {
	dotfiles: 'ignore',
	index: false
}
// extensions: ['htm', 'html', 'css', 'js'],



let app = express()
app.use(morgan('combined'))

app.use(express.static(path.join(__dirname, 'public'),
options))
app.use(bodyParser.urlencoded({
	extended: true
}))
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, '/src/views'))
app.engine('handlebars', exphbs({
	defaultLayout: 'index',
	helpers: require("./src/helpers/handlebar-helper").helpers,
	layoutsDir: 'src/views/layouts',
	partialsDir: [
		'src/views/partials'
	]
}))


// app.use(expSession({
	// 	secret: 'anyStringOfText',
	// 	saveUnInitialized: true,
	// 	resave: true
	// }))

app.use(cookieParser())
var SequelizeStore = require('connect-session-sequelize')(session.Store);


app.use(session({
    secret: 'AsdfghjklpoiUytrEWQZXCvbnmLKJUiOPKJHGtrfdD_+)KKNCMKKD884615',
    saveUninitialized: true,
	resave: true,
	store: new SequelizeStore({
		db: models.sequelize
	})
}));
app.use(passport.initialize());
app.use(passport.session());


require('./src/config/passport.js')(models.User, passport);
require('./src/routes')(app,passport);



let server = app.listen(process.env.PORT || 3000, function () {
	let host = server.address().address
	let port = server.address().port
	console.log('Example app listening at http://%s:%s', host, port)

})

let io = require("socket.io")(server, {})

function onConnection(socket){
	socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
	socket.on('clear', (data) => socket.broadcast.emit('clear', data));
  }

io.on('connection', onConnection);




