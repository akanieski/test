var CreateTags = function () {
  this.up = function (next) {
    var def = function (t) {
          t.column('value', 'string');
        }
      , callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.createTable('Tag', def, callback);
  };

  this.down = function (next) {
    var callback = function (err, data) {
          if (err) {
            throw err;
          }
          else {
            next();
          }
        };
    this.dropTable('Tag', callback);
  };
};

exports.CreateTags = CreateTags;
