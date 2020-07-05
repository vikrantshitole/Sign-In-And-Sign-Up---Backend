const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModels');
const Helpers = require('../Helpers/helpers');
const dbconfig = require('../Config/secret');
const { db } = require('../models/userModels');
module.exports = {
  //validtion code for user

  async createUser(req, res) {
    const schema = Joi.object().keys({
      username: Joi.string().min(5).max(10).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(5).required(),
    });

    //validting user
    const { error, value } = Joi.validate(req.body, schema);
    // cons/ole.log(value);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    //checking for existance of email id

    const userEmail = await User.findOne({
      email: Helpers.lowercase(req.body.email),
    });
    if (userEmail) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Email already exists' });
    }

    //checking for existance of username

    const userName = await User.findOne({
      username: Helpers.firstUpper(req.body.username),
    });
    if (userName) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: 'username already exists' });
    }
    // encrypting password
    return bcrypt.hash(value.password, 10, (err, hash) => {
      // If error occured whileencrypting the password
      if (err) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Error while hashing password' });
      }
      // Creating the object with values passed from frontend
      const body = {
        username: Helpers.firstUpper(value.username),
        email: Helpers.lowercase(value.email),
        password: hash,
      };
      // Inserting the Values to the Database
      User.create(body)
        .then((user) => {
          res
            .status(HttpStatus.CREATED)
            .json({ message: 'User created successfully', user });
        })
        .catch((err) => {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error Occured' });
        });
    });
  },
  // login user function
  async loginUser(req, res) {

    // Checking weather the data received data from frontend is empty
    if (!req.body.username || !req.body.password) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'No empty field allowed' });
    }
    // Checking weather the Username exists in the database
    await User.findOne({
      username: Helpers.firstUpper(req.body.username),
    })
      .then((user) => {
        // If username does not  exist in the database
        if (!user) {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Username name not found' });
        }
        // Checking the password received from of the user and the password received from frontend
        return bcrypt
          .compare(req.body.password, user.password)
          .then((result) => {
            // If password does not match
            if (!result) {
              res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Password is incorrect' });
            }
            return res
              .status(HttpStatus.OK)
              .json({ message: 'Login successful', user });
          });
      })
      .catch((err) => {
        // Error occured while finding the username

        // console.log(err);

        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });
      });
  },
  // Finding user exists or not
  async findUser(req, res) {
    // Checking weather the data received from frontend is empty
    if (!req.params.username) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'No empty field allowed' });
    }
    // Checking weather the username exists
    await User.findOne({
      username: Helpers.firstUpper(req.params.username),
    })
      .then((data) => {
        if (!data) {
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Username not found' });
        }
        return res
          .status(HttpStatus.OK)
          .json({ message: 'username  found', data });
      })
      .catch((err) => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });
      });
  },
  // Method for changing the password
  async changePassword(req, res) {
    // Checking weather the data received from frontend is empty

    if (
      !req.body.currentPassword ||
      !req.body.changePassword ||
      !req.body.confirmPassword
    ) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'No empty field allowed' });
    }
    //Checking for user to change the Password
    await User.findOne({
      username: Helpers.firstUpper(req.params.username),
    }).then(async (user) => {
      // Checking weather the currentpassord and the password in database is correct or not
      const result = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      // checking if password is not correct
      if (!result) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Password is incorrect' });
      }
      // Checking change password and confirm password
      if (req.body.changePassword !== req.body.confirmPassword) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'change Password and confirm password does not match',
        });
      }
      // encrypting change Password
      return bcrypt.hash(req.body.changePassword, 10, (err, hash) => {
        if (err) {
          return res
            .status(HttpStatus.BAD_REQUEST)
            .json({ message: 'Error while hashing password' });
        }
        const body = {
          username: user.username,
          email: user.username,
          password: hash,
        };
        // Updating the password
        User.findOneAndUpdate(
          { _id: user._id },
          { $set: body },
          { new: true, useFindAndModify: false }
        )
          .then((user_1) => {
            res
              .status(HttpStatus.OK)
              .json({ message: 'Password Changed successfully', user });
          })
          .catch((err_1) => {
            // console.log(err_1);

            res
              .status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: 'Error Occured' });
          });
      });
    });
  },
};
