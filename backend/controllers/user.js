const User = require("./../models/User");
const bcrypt = require("bcrypt");

module.exports.createUser = async (req, res) => {
  try {
    // Create password hash
    const hash = await bcrypt.hash(req.body.password, 10);

    req.body.password = hash;
    // Add user to User model
    const user = await User.create(req.body);

    return res.status(200).json({
      data: { user: { id: user.id } },
      message: "User created.",
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error while creating user.",
    });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.query.id } });

    return res.status(200).json({
      data: { user: user },
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error while fetching user.",
    });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({});

    return res.status(200).json({
      data: { users: users },
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error while fetching all users.",
    });
  }
};