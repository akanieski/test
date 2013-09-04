var flow = require('flow');

var Posts = function () {
  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];

  this.index = function (req, resp, params) {
    var self = this;

    // Get each post
    geddy.model.Post.all(function(err, posts) {
      // Get all Tags related to each post
      flow.exec(function(){
        var next = this;
        if(posts.length === 0) next(); // No posts just move on
        posts.forEach(function(p){
          var tag = geddy.model.Tag.create({postId: p.id, value: "Test Tag"});
          tag.save(next.MULTI());
        });
      }, function(){ 
        // All posts are sure to now have tags
        var next = this;
        if(posts.length === 0) next(); // No posts just move on
        posts.forEach(function(p){
          geddy.model.Tag.all({postId: p.id}, next.MULTI(p.id));
        });
      }, function(results) {
        // When all tags are fetched, attach them to there posts
        posts.forEach(function(p){
          p.tags = results[p.id][1];
        });
        // return posts
        self.respond({params: params, posts: posts});
      });
    });
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
    params.comments = ['test comment 1', 'test comment 2'];

    var self = this
      , post = geddy.model.Post.create(params);

    if (!post.isValid()) {
      this.flash.error(post.errors);
      this.redirect({action: 'add'});
    }
    else {
      post.save(function(err, data) {
        if (err) {
          self.flash.error(err);
          self.redirect({action: 'add'});
        }
        else {
          self.redirect({controller: self.name});
        }
      });
    }
  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.Post.first(params.id, function(err, post) {
      if (!post) {
        var err = new Error();
        err.statusCode = 404;
        self.error(err);
      }
      else {
        self.respond({params: params, post: post.toObj()});
      }
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.Post.first(params.id, function(err, post) {
      if (!post) {
        var err = new Error();
        err.statusCode = 400;
        self.error(err);
      }
      else {
        self.respond({params: params, post: post});
      }
    });
  };

  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.Post.first(params.id, function(err, post) {
      post.updateProperties(params);
      if (!post.isValid()) {
        this.flash.error(post.errors);
        this.redirect({action: 'edit'});
      }
      else {
        post.save(function(err, data) {
          if (err) {
            self.flash.error(err);
            self.redirect({action: 'edit'});
          }
          else {
            self.redirect({controller: self.name});
          }
        });
      }
    });
  };

  this.destroy = function (req, resp, params) {
    var self = this;

    geddy.model.Post.remove(params.id, function(err) {
      if (err) {
        self.flash.error(err);
        self.redirect({action: 'edit'});
      }
      else {
        self.redirect({controller: self.name});
      }
    });
  };

};

exports.Posts = Posts;
