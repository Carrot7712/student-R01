const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true, nest: true })
      .then(restaurants => res.render('admin/restaurants', { restaurants: restaurants }))
      .catch(err => console.error(err))
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
      })
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  postRestaurant: (req, res) => {
    if (!req.body.name || !req.body.tel) {
      req.flash('error_messages', '餐廳名稱與電話為必填資訊')
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) console.log(`Error: ${err}`)
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null
        })
          .then(() => {
            req.flash('success_messages', '已成功創建餐廳資料')
            res.redirect('/admin/restaurants')
          })
          .catch(err => console.error(err))
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null
      })
        .then(() => {
          req.flash('success_messages', '已成功創建餐廳資料')
          res.redirect('/admin/restaurants')
        })
        .catch(err => console.error(err))
    }
  },
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => res.render('admin/create', { restaurant: restaurant.toJSON() }))
  },
  putRestaurant: (req, res) => {
    if (!req.body.name || !req.body.tel) {
      req.flash('error_messages', '餐廳名稱與電話為必填資訊')
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) console.log(`Error: ${err}`)
        return Restaurant.findByPk(req.params.id).then(restaurant => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: file ? img.data.link : restaurant.image
          }).then(() => {
            req.flash('success_messages', '已成功修改餐廳資料')
            res.redirect('/admin/restaurants')
          })
        })
      })
    } else {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        restaurant.update({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: restaurant.image
        })
          .then(() => {
            req.flash('success_messages', '已成功修改餐廳資料')
            res.redirect('/admin/restaurants')
          })
          .catch(err => console.error(err))
      })
    }
  },
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => restaurant.destroy())
      .then(() => res.redirect('/admin/restaurants'))
      .catch(err => console.error(err))
  },
  getUsers: (req, res) => {
    return User.findAll({ raw: true, nest: true }).then(users => {
    res.render('admin/users', { users: users })
    })
      .catch(err => console.error(err))
  },
  toggleAdmin: (req, res) => {
    const id = req.params.id
    return User.findByPk(id).then(user => {
      if (user.email === 'root@example.com') {
        req.flash('error_messages', '禁止變更管理者權限')
        return res.redirect('back')
      }
      user.isAdmin === false ? user.isAdmin = true : user.isAdmin = false
      return user.update({ isAdmin: user.isAdmin })
        .then(() => {
          req.flash('success_messages', '使用者權限變更成功')
          res.redirect('/admin/users')
        })
    })
  }
}

module.exports = adminController
