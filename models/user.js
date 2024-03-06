var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	
	unique_id: Number,
	 firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobileNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
  
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordConf: String,
  creationTime: { type: Date, default: Date.now },
  lastUpdate: { type: Date, default: Date.now },
}),
User = mongoose.model('User', userSchema);

module.exports = User;