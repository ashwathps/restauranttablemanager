## Restaurant table management API

A API service built with Node.js to manage the front of house for a restaurant that allows managers to assign tables to waiters (and to see an overall view of assignment), and allows waiters to view their table assignments.

### Assumptions
The assumptions are only limited to the initial data set and for DB bootstrap, the API operation itself is not limited by these assumptions.

* There is 1 manager
* There are 2 restaurants with 20 tables  each
* There are 8 waiters
* Table, Manager, Restaurant and Waiter ids are shothanded to `t-1, m-1, r-1, w-1` respectively for easy access.
* Name to id mapping.

### Design
* The data for the API is driven by a `tableManager` which is the source of truth for all **active** waiter assignments for the restaurant.
* The data is stored as JSON documents (a NoSQL store) using lokijs for the scope of this program. This can be easily replaced with MongoDB or Azure DocumentDB.
* Inventory (restaurants, managers, waiters) is stored in their respective collections.
* All CRUD operations are stateless, self contained with all the required information for successfully assign waiters to appropriate table to the right restaurant.
* The service uses ***koa route middlewares*** to check if a manager is authorized to assign waiters to tables, driven by the inventory. Operations on the inventory must be treated as admin operations (not the scope of this program).

### Seed data
The DB is bootrapped upon load with the `seed.json`

## Getting started
### Setup instructions & system requirements
Install Git and NodeJs **v6** or above

#### Setup:
```
  git clone 'this repo'
  npm install
```
#### Running the API service
```
  > node index.js
```
The service runs on a pre configured port 8009 by default. API requests are made using http://localhost:8009/api 

#### Unit tests
The tests are written using BDD. NodeJS has an extensive library collection to support BDD. This repo uses chai, assert, should and SinonJs for method stubs.
```
  > grunt test
```
#### Coverage

```
  Running `grunt test` will create a coverage report html.
```
#### Linting
```
  > grunt eslint
```

## API Spec
* Waiter View per waiter

  [GET] `/api/v1/waiter/<w-id>/assignments`

  [RESPONSE]
  
  ```  
    "Tom Adams": "t-2,t-3,t-4,t-8"
  ```

* Waiter View

  [GET] `/api/v1/restaurant/<r-id>/waiterview`

  [RESPONSE]
  ```
  {
    "Bob Jones": "t-1,t-6,t-7",
    "Tom Adams": "t-2,t-3,t-4,t-8",
    "Pete Max": "t-9,t-10"
  }
  ```

* Manager View

  [GET] `/api/v1/restaurant/<r-id>/managerview`

  [RESPONSE]
  ```
  [
    "t-1: Bob Jones",
    "t-2: Tom Adams",
    "t-3: Tom Adams",
    "t-4: Tom Adams",
    "t-6: Bob Jones",
    "t-7: Bob Jones",
    "t-8: Tom Adams",
    "t-9: Pete Max",
    "t-10: Pete Max",
    "t-5: Unassigned",
    "t-11: Unassigned",
    "t-12: Unassigned",
    "t-13: Unassigned",
    "t-14: Unassigned",
    "t-15: Unassigned",
    "t-16: Unassigned",
    "t-17: Unassigned",
    "t-18: Unassigned",
    "t-19: Unassigned",
    "t-20: Unassigned"
  ]
  ```

* Assign a waiter to a table

  [PUT] `/api/v1/restaurant/<r-id>/table/<t-id>`

  [BODY]
  ```
  {
    "mid": "m-1", /* assigned manager for the restaurant */
    "wid": "w-14" /* waiter id */
  }
  ```
  
* Unassign a waiter from a table

  [DELETE] `/api/v1/restaurant/<r-id>/table/<t-id>`

  [BODY]
  ```
  {
    "mid": "m-1", /* assigned manager for the restaurant */
    "wid": "w-14" /* waiter id */
  }
  ```

### Persistence
The service uses `lokijs` as it's database and persisted in local filesystem. Although `lokijs` can be used as a full fledged DB system, it's usage has been limited to its core `create` and `query` functionality *only*. All other operations like join, map-reduce and merge has been accomplished using `lodash`.

### Sample Views
* Manager View
  * Table 1: Bob Jones
  * Table 2: Tom Adams
  * Table 3: Unassigned
  * Etc

* Waiter View
  * Bob Jones: Table 1, Table 4
  * Tom Adams: Table 2
