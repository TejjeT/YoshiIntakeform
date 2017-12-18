var JDBC = require('jdbc');
var jinst = require('jdbc/lib/jinst');
var config = require('../config/TeradataConfig.js');

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath(['./terajdbc4.jar','./tdgssconfig.jar']);
}
var teradatadb = new JDBC(config.teradataConfig);
var teradatadbInit = false;
function reserve(db, callback) {
  db.reserve(function(err, connobj) {
    if (err) {
      return callback(err);
    } else {
      return callback(null, connobj, connobj.conn);
    }
  });
};

function release(db, connobj, err, result, callback) {
  db.release(connobj, function(e) {
    if (err) {
      return callback(err);
    } else {
      return callback(null, result);
    }
  });
};

exports.teradatadb = function(callback) {
  if (!teradatadbInit) {
    teradatadb.initialize(function(err) {
      if (err) {
        return callback(err);
      } else {
        teradatadbInit = true;
        return callback(null, teradatadb);
      }
    });
  } else {
    return callback(null, teradatadb);
  }
};



exports.prepare = function(db, sql, callback) {
  reserve(db, function(err, connobj, conn) {
    conn.prepareStatement(sql, function(err, preparedstatement) {
      release(db, connobj, err, preparedstatement, callback);
    });
  });
};
exports.execute = function(db, sql, callback) {
  reserve(db, function(err, connobj, conn) {
    conn.createStatement(function(err, statement) {
      if (err) {
        callback(err);
      } else {
        statement.executeQuery(sql, function(err, resultset) {
          if (err) {
            callback(err)
          } else {
            // Convert the result set to an object array.
            release(db, connobj, err, resultset, callback);
          }
        });
      }
    });

  });
};

exports.prepareCall = function(db, sql, callback) {
  reserve(db, function(err, connobj, conn) {
    conn.prepareCall(sql, function(err, callablestatement) {
      release(db, connobj, err, callablestatement, callback);
    });
  });
};

exports.update = function(db, sql, callback) {
  reserve(db, function(err, connobj, conn) {
    conn.createStatement(function(err, statement) {
      if (err) {
        release(db, connobj, err, null, callback);
      } else {
        statement.executeUpdate(sql, function(err, result) {
          release(db, connobj, err, result, callback);
        });
      }
    });
  });
};

exports.tableexists = function(db, catalog, schema, name, callback) {
  reserve(db, function(err, connobj, conn) {
    conn.getMetaData(function(err, metadata) {
      if (err) {
        release(db, connobj, err, null, callback);
      } else {
        metadata.getTables(catalog, schema, name, null, function(err, resultset) {
          if (err) {
            release(db, connobj, err, null, callback);
          } else {
            resultset.toObjArray(function(err, results) {
              release(db, connobj, err, results.length > 0, callback);
            });
          }
        });
      }
    });
  });
};

exports.metadata = function(db, callback) {
  reserve(db, function(err, connobj, conn) {
    conn.getMetaData(function(err, metadata) {
      release(db, connobj, err, metadata, callback);
    });
  });
};