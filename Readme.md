
# Express Paginate

Node.js pagination middleware and view helpers.

To be used in combination with database pagination plugins such as [mongoose-paginate](https://github.com/edwardhotchkiss/mongoose-paginate).

**This module was created namely for use with [Eskimo](http://eskimo.io)**



## Install

```bash
npm install -S express-paginate
```



## API

```js
var paginate = require('express-paginate')
```

### paginate

This creates a new instance of `express-paginate`.


### paginate.middleware(limit, maxLimit)

This middleware validates and supplies default values to `req.query.limit`, `req.query.page`, `res.locals.paginate`, `res.locals.hasPreviousPages`, and `res.locals.hasNextPages`.

#### Arguments

* `limit` a Number to limit results returned per page (defaults to `10`)
* `maxLimit` a Number to restrict the number of results returned to per page (defaults to `50`) &ndash; through this, users will not be able to override this limit (e.g. they can't pass `?limit=10000` and crash your server)


### paginate.href(req)

When you use the `paginate` middleware, it injects a view helper function called `paginate.href` as `res.locals.paginate`, which you can use in your views for paginated hyperlinks (e.g. as the `href` in `<a>Prev</a>` or `<a>Next</a>`).

By default, the view helper `paginate.href` is already executed with the inherited `req` variable, therefore it becomes a function capable of returning a String when executed.

When executed with `req`, it will return a function with one argument called `prev`.

This argument `prev` is a Boolean and is completely optional (defaults to `false`).

Pass `true` as the value for `prev` when you want to create a `<button>` or `<a>` that points to the previous page (e.g. it would generate a URL such as the one in the `href` attribute of `<a href="/users?page=1&limit=10">Prev</a>` if `req.query.page` is `2`).

[See the example below for an example of how implementation looks](#example).

#### Arguments

* `req` (**required**) &ndash; the request object returned from Express middleware invocation

#### Returned function arguments when invoked with `req`

* `prev` (optional) &ndash; a Boolean to determine whether or not to increment the hyperlink returned by `1` (e.g. for "Next" page links)


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



## Example

```js

// # app.js

var express = require('express')
var paginate = require('express-paginate')

// keep this before all routes that will use pagination
app.use(paginate.middleware(10, 50))

app.get('/users', function(req, res, next) {

  // This example assumes you've previously defined `Users`
  // as `var Users = db.model('Users')` if you are using `mongoose`
  // and that you've added the Mongoose plugin `mongoose-paginate`
  // to the Users model via `User.plugin(require('mongoose-paginate'))`
  Users.paginate({}, req.query.page, req.query.limit, function(err, pageCount, users, itemCount) {

    if (err) return next(err)

    res.format({
      html: function() {
        res.render('users', {
          users: users,
          pageCount: pageCount,
          itemCount: itemCount
        })
      },
      json: function() {
        // inspired by Stripe's API response for list objects
        res.json({
          object: 'list',
          has_more: paginate.hasNextPages(req)(pageCount),
          data: users
        })
      }
    })

  })

})

var app = express()
app.listen(3000)
```

```jade

//- users.jade

h1 Users
ul
  each user in users
    li= user.email

include _paginate
```

```jade

//- _paginate.jade

//- This examples makes use of Bootstrap 3.x pagination classes

if (paginate.hasPreviousPages || paginate.hasNextPages(pageCount)
  .navigation.well-sm#pagination
    ul.pager
      if paginate.hasPreviousPages
        li.previous
          a(href=paginate.href(true)).prev
            i.fa.fa-arrow-circle-left
            |  Previous
      if paginate.hasNextPages(pageCount)
        li.next
          a(href=paginate.href()).next
            | Next&nbsp;
            i.fa.fa-arrow-circle-right
```


