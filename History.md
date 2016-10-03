
[0.2.2](https://github.com/niftylettuce/express-paginate/compare/0.2.1...0.2.2) / 2016-09-29
===================
Fix bugs related to limit parameters ([#24](https://github.com/expressjs/express-paginate/pull/24)):
- when negative limit is given the calculation of the offset/skip was happening before changing the limit to zero
- there was no default for unparsable limit parameters - add zero as default.



[0.2.1](https://github.com/niftylettuce/express-paginate/compare/0.2.0...0.2.1) / 2016-07-14
===================
Fix `limit` option for `getArrayPages()` method ([#23](https://github.com/expressjs/express-paginate/pull/23)).



[0.2.0](https://github.com/niftylettuce/express-paginate/compare/0.1.1...0.2.0) / 2016-04-06
===================

We now allow you to pass `?limit=0` to get infinite (all) results.  This may impose security or performance issues for your application, so we suggest you to write a quick middleware fix such as the one below, or use rate limiting middleware to prevent abuse.

```js
app.all(function(req, res, next) {
  // set default or minimum is 10 (as it was prior to v0.2.0)
  if (req.query.limit <= 10) req.query.limit = 10;
  next();
});
```



[0.1.1](https://github.com/niftylettuce/express-paginate/compare/0.1.0...0.1.1) / 2016-02-13
===================



[0.1.0](https://github.com/niftylettuce/express-paginate/compare/0.0.9...0.1.0) / 2015-11-11
===================



[0.0.8](https://github.com/niftylettuce/express-paginate/compare/0.0.5...0.0.8) / 2015-04-14
===================



[0.0.5](https://github.com/niftylettuce/express-paginate/compare/0.0.4...0.0.5) / 2014-11-18
===================



[0.0.4](https://github.com/niftylettuce/express-paginate/compare/0.0.3...0.0.4) / 2014-11-12
===================



[0.0.3](https://github.com/niftylettuce/express-paginate/compare/0.0.2...0.0.3) / 2014-09-04
===================



[0.0.2](https://github.com/niftylettuce/express-paginate/compare/0.0.1...0.0.2) / 2014-06-13
===================



0.0.1 / 2014-06-12
===================
