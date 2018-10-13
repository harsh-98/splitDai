import bcrypt from 'bcryptjs'

export const randomString = () => {
	return Math.random().toString().substr(2)
}

export const createHashedPassword = (password) => {
	let salt = bcrypt.genSaltSync(10);
	let hash = bcrypt.hashSync(password, salt);
	return hash
}

export const getPicture = (gender) => {
	let maleImg = ['elliot.jpg', 'matthew.png', 'steve.jpg']
	let femaleImg = ['jenny.jpg', 'lindsay.png', 'rachel.jpg', 'veronika.jpg']
	if (gender == 'female'){
		maleImg = femaleImg;
	}
	let ind = Math.floor(Math.random()*maleImg.length);
	return '/images/avatar/'+maleImg[ind]
}
