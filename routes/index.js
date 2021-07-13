const express = require('express');
const router = express.Router();
const User = require('../models/user-scema');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  // filename: (req, file, cb) => {
  //   cb(null, `${Date.now()}-${file.originalname}`);
  //   console.log(file.mimetype);
  // }
})

const fileFilter = (req, file, cb) => {
  if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const upload = multer({ dest: 'uploads/', storage: fileStorage });


// create a user
router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    const { fname, lname, email, phone } = req.body;
    const user = await User.findOne({ email }).exec();
    if (user) {
      res.status(401).json({
        err: 'user already exists'
      });
    } else {
      const avatar = req.file && req.file.filename;
      const userObj = { fname, lname, email, avatar }
      const user = await User.create(userObj);
      // userObj.id = user.id
      // await user.save();
      res.status(201).json(user);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ err: error._message || 'something went wrong' });
  }

})

// update user
router.put('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const id = req.params && req.params.id;
    const user = await User.findOne({ _id: id });
    console.log(req.body);
    const obj = req.body || {}
    const avatar = req.file && req.file.filename;
    if (avatar) {
      obj.avatar = avatar;
    }
    const newUser = { ...user, ...obj };
    user.overwrite(newUser);
    await user.save();
    res.status(200).json({ msg: 'user updated' });
  } catch (err) {
    console.log(error);
    res.status(400).json({ err: error._message || 'something went wrong' });
  }
})

// delete user
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params && req.params.id;
    const user = await User.findOne({ _id: id });
    if (user) {
      await user.remove();
      res.status(200).json({ msg: 'user deleted' });
    } else {
      res.status(404).json({ err: 'user not found' });
    }
  } catch (err) {
    console.log(error);
    res.status(400).json({ err: error._message || 'something went wrong' });
  }
});

// get detail of single user
router.get('/:id', async (req, res) => {
  try {
    const id = req.params && req.params.id;
    const user = await User.findOne({ _id: id });
    res.json(user);
  } catch (_) {
    res.json(null);
  }
});


// get all users
router.get('/', async (req, res) => {
  try {
    // const id = req.params && req.params.id;
    const users = await User.find();
    res.json(users);
  } catch (_) {
    console.log(error);
    res.status(400).json({ err: error._message || 'something went wrong' });
  }
});


router.get('/file/:id', async (req, res) => {
  try {
    const filepath = __dirname.split('/');
    filepath[filepath.length - 1] = 'uploads'
    const imagePath = filepath.join('/');
    const fileId = req.params && req.params.id;
    // const path = path.joi

    const contents = fs.readFileSync(`${imagePath}/${fileId}`, { encoding: 'base64' },);
    res.status(200).json({ file: `data:image/png;base64,${contents}` });
  } catch (err) {
    console.log(error);
    res.status(400).json({ err: 'something went wrong' });
  }
});

module.exports = router;
