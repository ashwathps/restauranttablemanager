'use-strict';

const Loki = require('lokijs');
const seedData = require('./data/seed.json');
const ld = require('lodash');

const db = new Loki('db.json', {
  autoload: true,
  autosave: true,
  autosaveInterval: 4000, // save every four seconds for our example
});

let tableManager = {};
let waiterTable = {};
let restaurantTable = {};
let tableTable = {};

function createCollections() {
  tableManager = db.addCollection('tableManager');
  waiterTable = db.addCollection('waiters');
  restaurantTable = db.addCollection('restaurants');
  tableTable = db.addCollection('tables');
}

function getCollections() {
  tableManager = db.getCollection('tableManager');
  waiterTable = db.getCollection('waiters');
  restaurantTable = db.getCollection('restaurants');
  tableTable = db.getCollection('tables');
}

function bootstrapDB() {
  createCollections();

  ld.forEach(seedData.data, (d) => {
    tableManager.insert(d);
  });

  ld.forEach(seedData.waiters, (w) => {
    waiterTable.insert(w);
  });

  ld.forEach(seedData.restaurants, (r) => {
    restaurantTable.insert(r);
  });

  ld.forEach(seedData.tables, (t) => {
    tableTable.insert(t);
  });

  db.saveDatabase();
}
/* eslint-disable no-unused-vars, global-require */
try {
  const existingDB = require('../../db.json');
  db.loadDatabase({}, () => {
    getCollections();
  });
} catch (e) {
  bootstrapDB();
}
/* eslint-enable no-unused-vars, global-require */

exports = {
  getAssignmentsForWaiter: wid => tableManager.find({ wid }),
  getAssignmentForTable: tid => tableManager.findOne({ tid }),
  getAssignedTablesForRestaurant: rid => tableManager.find({ rid }),
  getAllAssignments: () => tableManager.data,
  getAllWaiters: () => waiterTable.data,

  getDetailsForWaiter: wid => waiterTable.findOne({ wid }),
  getRestaurantForManager: (rid, mid) => restaurantTable.find({ rid, mid }),
  getTablesInRestaurant: rid => tableTable.find({ rid }),

  assignWaiterForTable: (rid, mid, tid, wid) => {
    tableManager.insert({ rid, mid, tid, wid, hid: 'h-1' });
    db.saveDatabase();
  },
  unassignWaiterForTable: (rid, mid, tid, wid) => {
    tableManager.removeWhere({ rid, mid, tid, wid, hid: 'h-1' });
    db.saveDatabase();
  },
};

module.exports = exports;