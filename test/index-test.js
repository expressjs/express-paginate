var paginate = require('../index');

describe('paginate', function(){

  describe('.hasNextPages(req)', function(){

    beforeEach(function(){
      this.req = {query:{page:3}};
    });

    it('should return function', function(){
      paginate.hasNextPages(this.req).should.be.a('function');
    });

    describe('the returned function', function(){

      it('should return true when there are more pages', function(){
        paginate.hasNextPages(this.req)(4).should.be.true;
      });

      it('should return false when there are no more pages', function(){
        paginate.hasNextPages(this.req)(3).should.be.false;
      });

      it('should throw an error when pageCount is not a number', function(){
        (function(){
          paginate.hasNextPages(this.req)('');
        }).should.throw(/not a number/);
      });

      it('should throw an error when pageCount is less than zero', function(){
        (function(){
          paginate.hasNextPages(this.req)('');
        }).should.throw(/\> 0/);
      });

    })

  });

});
