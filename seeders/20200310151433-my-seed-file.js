'use strict';
const bcrypt = require('bcrypt-nodejs')
const faker = require('faker')
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.bulkInsert('Users', [{
      email: 'admin@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'admin',
      avatar: faker.image.imageUrl(),
      introduction: faker.lorem.text(),
      role: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'user1@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'user1',
      avatar: faker.image.imageUrl(),
      introduction: faker.lorem.text(),
      role: '2',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'user2',
      avatar: faker.image.imageUrl(),
      introduction: faker.lorem.text(),
      role: '2',
      createdAt: new Date(),
      updatedAt: new Date()
    }],{})
    
    queryInterface.bulkInsert('Tweets', 
      Array.from({length: 5}).map(data=>
      ({
        description: faker.lorem.text(),
        UserId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ,{})

    queryInterface.bulkInsert('Tweets', 
      Array.from({length: 5}).map(data=>
      ({
        description: faker.lorem.text(),
        UserId: '2',
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ,{})

    return queryInterface.bulkInsert('Tweets', 
      Array.from({length: 5}).map(data=>
      ({
        description: faker.lorem.text(),
        UserId: '3',
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ,{})

  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', null, {})
    return queryInterface.bulkDelete('Tweets', null,{})
  }
};
