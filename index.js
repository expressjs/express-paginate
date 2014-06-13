
//     express-paginate
//     Copyright (c) 2014- Nick Baugh <niftylettuce@gmail.com> (http://niftylettuce.com)
//     MIT Licensed

// Node.js pagination middleware and view helpers.

// * Author: [@niftylettuce](https://twitter.com/#!/niftylettuce)
// * Source: <https://github.com/niftylettuce/express-paginate>

var querystring = require('querystring')
var _ = require('lodash')

exports = module.exports

exports.href = function paginate(req) {
  return function(prev) {
    var query = _.clone(req.query)
    prev = (typeof prev === 'boolean') ? prev : false
    query.page = prev ? query.page-= 1 : query.page += 1
    query.page = (query.page < 1) ? 1 : query.page
    return req.path + '?' + querystring.stringify(query)
  }
}


exports.hasNextPages = function(req) {

  return function(pageCount) {

    if (typeof pageCount !== 'number' || pageCount < 0)
      throw new Error('express-paginate: `pageCount` is not a number > 0')

    return req.query.page < pageCount

  }

}

exports.middleware = function(limit, maxLimit) {

  var that = this

  that.limit = (typeof limit === 'number') ? parseInt(limit, 10) : 10

  that.maxLimit = (typeof maxLimit === 'number') ? parseInt(maxLimit, 10) : 50

  if (that.limit < 1)
    throw new Error('express-paginate: `limit` cannot be less than 1')

  if (that.maxLimit < 1)
    throw new Error('express-paginate: `maxLimit` cannot be less than 1')

  return function middleware(req, res, next) {

    req.query.page = (typeof req.query.page === 'string') ? parseInt(req.query.page, 10) : 1

    req.query.limit = (typeof req.query.limit === 'string') ? parseInt(req.query.limit, 10) : that.limit

    if (req.query.limit > that.maxLimit)
      req.query.limit = that.maxLimit

    if (req.query.page < 1)
      req.query.page = 1

    if (req.query.limit < 1)
      req.query.limit = 1

    res.locals.paginate = {}
    res.locals.paginate.href = exports.href(req)
    res.locals.paginate.hasPreviousPages = req.query.page > 1
    res.locals.paginate.hasNextPages = exports.hasNextPages(req)

    next()

  }

}
