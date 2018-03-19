
# express-paginate

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![MIT License][license-image]][license-url]
[![Slack][slack-image]][slack-url]

> Node.js pagination middleware and view helpers.

**Looking for a Koa version?**  Try using <https://github.com/koajs/ctx-paginate>, which is forked directly from this package!

**v0.2.0+**: As of `v0.2.0`, we now allow you to pass `?limit=0` to get infinite (all) results.  This may impose security or performance issues for your application, so we suggest you to write a quick middleware fix such as the one below, or use rate limiting middleware to prevent abuse.

```js
app.all(function(req, res, next) {
  // set default or minimum is 10 (as it was prior to v0.2.0)
  if (req.query.limit <= 10) req.query.limit = 10;
  next();
});
```


## Install

```bash
npm install -S express-paginate
```


## API

```js
const paginate = require('express-paginate');
```

### paginate

This creates a new instance of `express-paginate`.


### paginate.middleware(limit, maxLimit)

This middleware validates and supplies default values to `req.skip` (an alias of `req.offset`, which can be used to skip or offset a number of records for pagination, e.g. with Mongoose you would do `Model.find().skip(req.skip)`), `req.query.limit`, `req.query.page`, `res.locals.paginate`, `res.locals.hasPreviousPages`, and `res.locals.hasNextPages`.

#### Arguments

* `limit` a Number to limit results returned per page (defaults to `10`)
* `maxLimit` a Number to restrict the number of results returned to per page (defaults to `50`) &ndash; through this, users will not be able to override this limit (e.g. they can't pass `?limit=10000` and crash your server)


### paginate.href(req)

When you use the `paginate` middleware, it injects a view helper function called `paginate.href` as `res.locals.paginate`, which you can use in your views for paginated hyperlinks (e.g. as the `href` in `<a>Prev</a>` or `<a>Next</a>`).

By default, the view helper `paginate.href` is already executed with the inherited `req` variable, therefore it becomes a function capable of returning a String when executed.

When executed with `req`, it will return a function with two optional arguments, `prev` (Boolean) and `params` (String).

The argument `prev` is a Boolean and is completely optional (defaults to `false`).

The argument `params` is an Object and is completely optional.

Pass `true` as the value for `prev` when you want to create a `<button>` or `<a>` that points to the previous page (e.g. it would generate a URL such as the one in the `href` attribute of `<a href="/users?page=1&limit=10">Prev</a>` if `req.query.page` is `2`).

Pass an object for the value of `params` when you want to override querystring parameters &ndash; such as for filtering and sorting (e.g. it would generate a URL such as the one in the `href` attribute of `<a href="/users?page=1&limit=10&sort=name">Sort By Name</a>` if `params` is equal to `{ sort: 'name' }`.

Note that if you pass only one argument with a type of Object, then it will generate a `href` with the current page and use the first argument as the value for `params`.  This is useful if you only want to do something like change the filter or sort querystring param, but not increase or decrease the page number.

[See the example below for an example of how implementation looks](#example).

#### Arguments

* `req` (**required**) &ndash; the request object returned from Express middleware invocation

#### Returned function arguments when invoked with `req`

* `prev` (optional) &ndash; a Boolean to determine whether or not to increment the hyperlink returned by `1` (e.g. for "Next" page links)
* `params` (optional) &ndash; an Object of querystring parameters that will override the current querystring in `req.query` (note that this will also override the `page` querystring value if `page` is present as a key in the `params` object) (e.g. if you want to make a link that allows the user to change the current querystring to sort by name, you would have `params` equal to `{ sort: 'name' }`)

### paginate.hasPreviousPages

When you use the `paginate` middleware, it injects a view helper Boolean called `hasPreviousPages` as `res.locals.hasPreviousPages`, which you can use in your views for generating pagination `<a>`'s or `<button>`'s &ndash; this utilizes `req.query.page > 1` to determine the Boolean's resulting value (representing if the query has a previous page of results)


### paginate.hasNextPages(req)

When you use the `paginate` middleware, it injects a view helper function called `hasNextPages` as `res.locals.hasPreviousPages`, which you can use in your views for generating pagination `<a>`'s or `<button>`'s &ndash; if the function is executed, it returns a Boolean value (representing if the query has another page of results)

By default, the view helper `paginate.hasNextPages` is already executed with the inherited `req` variable, therefore it becomes a function capable of returning a Boolean when executed.

When executed with `req`, it will return a function that accepts two required arguments called `pageCount` and `resultsCount`.

#### Arguments

* `req` (**required**) &ndash; the request object returned from Express middleware invocation

#### Returned function arguments when invoked with `req`

* `pageCount` (**required**) &ndash; a Number representing the total number of pages for the given query executed on the page

### paginate.getArrayPages(req)

Get all the page urls with limit.
![petronas contest 2015-10-29 12-35-52](https://cloud.githubusercontent.com/assets/3213579/10810997/a5b0b190-7e39-11e5-9cca-fb00a2142640.png)

#### Arguments

* `req` (**required**) &ndash; the request object returned from Express middleware invocation

#### Returned function arguments when invoked with `req`

* `limit` (**optional**) &ndash; Default: 3, a Number representing the total number of pages for the given query executed on the page.
* `pageCount` (**required**) &ndash; a Number representing the total number of pages for the given query executed on the page.
* `currentPage` (**required**) &ndash; a Number representing the current page.


## Example with mongoose ODM (see example 2 for Sequelize ORM)

```js

// # app.js

const express = require('express');
const paginate = require('express-paginate');
const app = express();

// keep this before all routes that will use pagination
app.use(paginate.middleware(10, 50));

app.get('/users', async (req, res, next) => {

  // This example assumes you've previously defined `Users`
  // as `const Users = db.model('Users')` if you are using `mongoose`
  // and that you are using Node v7.6.0+ which has async/await support
  try {

    const [ results, itemCount ] = await Promise.all([
      Users.find({}).limit(req.query.limit).skip(req.skip).lean().exec(),
      Users.count({})
    ]);

    const pageCount = Math.ceil(itemCount / req.query.limit);

    if (req.accepts('json')) {
      // inspired by Stripe's API response for list objects
      res.json({
        object: 'list',
        has_more: paginate.hasNextPages(req)(pageCount),
        data: results
      });
    } else {
      res.render('users', {
        users: results,
        pageCount,
        itemCount,
        pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)
      });
    }

  } catch (err) {
    next(err);
  }

});

app.listen(3000);

```

## Example 2 with Sequelize ORM
```js

// # app.js

const express = require('express');
const paginate = require('express-paginate');
const app = express();

// keep this before all routes that will use pagination
app.use(paginate.middleware(10, 50));

app.get('/users', async (req, res, next) => {

  // This example assumes you've previously defined `Users`
  // as `const Users = sequelize.define('Users',{})` if you are using `Sequelize`
  // and that you are using Node v7.6.0+ which has async/await support

  router.get("/all_users", (req, res, next) => {
    db.User.findAndCountAll({limit: req.query.limit, offset: req.skip})
      .then(results => {
        const itemCount = results.count;
        const pageCount = Math.ceil(results.count / req.query.limit);
        res.render('users/all_users', {
          users: results.rows,
          pageCount,
          itemCount,
          pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)
        });
    }).catch(err => next(err))
  });

});

app.listen(3000);
```

```pug

//- users.pug

h1 Users

//- this will simply generate a link to sort by name
//- note how we only have to pass the querystring param
//- that we want to modify here, not the entire querystring
a(href=paginate.href({ sort: 'name' })) Sort by name

//- this assumes you have `?age=1` or `?age=-1` in the querystring
//- so this will basically negate the value and give you
//- the opposite sorting order (desc with -1 or asc with 1)
a(href=paginate.href({ sort: req.query.age === '1' ? -1 : 1 })) Sort by age

ul
  each user in users
    li= user.email

include _paginate
```

```pug

//- _paginate.pug

//- This examples makes use of Bootstrap 3.x pagination classes

if paginate.hasPreviousPages || paginate.hasNextPages(pageCount)
  .navigation.well-sm#pagination
    ul.pager
      if paginate.hasPreviousPages
        li.previous
          a(href=paginate.href(true)).prev
            i.fa.fa-arrow-circle-left
            |  Previous
      if pages
        each page in pages
          a.btn.btn-default(href=page.url)= page.number
      if paginate.hasNextPages(pageCount)
        li.next
          a(href=paginate.href()).next
            | Next&nbsp;
            i.fa.fa-arrow-circle-right
```


## License

[MIT][license-url]


[npm-image]: https://img.shields.io/npm/v/express-paginate.svg?style=flat
[npm-url]: https://npmjs.org/package/express-paginate
[travis-image]: https://img.shields.io/travis/expressjs/express-paginate.svg?style=flat
[travis-url]: https://travis-ci.org/expressjs/express-paginate
[coveralls-image]: https://img.shields.io/coveralls/expressjs/express-paginate.svg?style=flat
[coveralls-url]: https://coveralls.io/r/expressjs/express-paginate?branch=master
[downloads-image]: http://img.shields.io/npm/dm/express-paginate.svg?style=flat
[downloads-url]: https://npmjs.org/package/express-paginate
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[slack-url]: http://slack.crocodilejs.com/
[slack-image]: http://slack.crocodilejs.com/badge.svg
