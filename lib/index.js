const Linq = require('./linq'), sqlite3 = require('sqlite3').verbose(), uri = require('url').URL, qs = require("querystring");

/**
 * 设置日志记录器
 * @param {function} logger - 日志记录器
 * @returns Linq
 */
Linq.prototype.setLogger = function (logger) {
    this.logger = logger;
    return this;
}
/**
 * 
 * @param {string} sql - 执行的sql语句
 * @param {Array} [values] - sql语句中占位符对应的值
 * @returns object
 */
Linq.prototype.execute = function (sql, values) {
    var exector = this.__exector, self = this;
    return new Promise(function (resolve, reject) {
        if (self.logger) {
            self.logger(sql, values);
        }
        exector.query(sql, values, function (error, results, fields) {
            if (error) {
                reject(error);
            }
            else {
                resolve(results);
            }
        })
    })
}
/**
 * 根据设置的条件查询数据库，并返回结果
 * @returns Array
 */
Linq.prototype.toArray = function () {
    var query = this.toSql(null, "select");
    //console.log(query)
    return this.execute(query.sql,query.params);
}
/**
 * 根据设置的条件查询数据库，并返回第一条记录
 * @returns object
 */
Linq.prototype.first = function () {
    this.take(1);
    return this.toArray().then(function (rows) {
        return rows[0];
    });
}

/**
 * 更新数据库中的记录
 * @param {lambda|object} updater - 更新内容
 * @param {object} [consts] - 更新lambda中的常量
 * @returns object
 */
Linq.prototype.update = function (updater, consts) {
    var query = this.toUpdateSql(updater, consts);
    return this.execute(query.sql,query.params);
}
/**
 * 删除数据库中的内容
 * @returns object
 */
Linq.prototype.delete = function () {
    var query = this.toDeleteSql();
    return this.execute(query.sql,query.params);
}
/**
 * 
 * @param {object} insertor - 向数据库中写入记录
 * @returns object
 */
Linq.prototype.insert = function (insertor) {
    var query = this.toInsertSql(insertor);
    return this.execute(query.sql,query.params);
}
/**
 * 统计数量
 * @returns Number
 */
Linq.prototype.count = function () {
    var query = this.toSql(null, "count");
    return this.execute(query.sql,query.params).then(function (rows) {
        return rows[0].COUNT;
    });
}
/**
 * 检查是否存在指定数据
 * @returns boolean
 */
Linq.prototype.exists = function () {
    var query = this.toExistsSql();
    return this.execute(query.sql,query.params).then(function (rows) {
        return rows.length > 0;
    });
}
/**
 * 检查对象是否存在，存在则更新，不存在则插入
 * @param {object} entity - 向数据库中添加或更新的对象
 * @param {function} handler - 在插入或更新前处理对象
 * @returns object
 */
Linq.prototype.insertOrUpdate = function (entity, handler) {
    if (typeof handler !== "function") {
        handler = function (e, mode) {
            return {
                entity: e,
                mode: mode
            }
        }
    }
    var self = this;
    return this.exists().then(function (exists) {
        return handler(entity, exists ? "UPDATE" : "INSERT");
    }).then(function (e) {
        if (e.mode === "UPDATE") {
            return self.update(e.entity);
        }
        else if (e.mode === "INSERT") {
            return self.insert(e.entity);
        }
    });
}
/**
 * 设置数sql语句执行对象
 * @param {object} exector - sql语句执行对象
 * @returns Linq
 */
Linq.prototype.setExector = function (exector) {
    this.__exector = exector;
    return this;
}
/**
 * 
 * @param {object|string} connectionStringOrconnectionObject - 数据库连接对象或字符串
 * @param {function} [logger] - 日志记录器
 * @class
 */
function db(_db_, logger, isTrans) {
    var exector = {
        query: function (sql, values, callback) {

            if (/^select/ig.test(sql)) {
                _db_.all(sql, values || [], function (err, rows) {
                    //console.log("执行结果",rows)
                    callback(err, rows);
                });
            }
            else {
                _db_.run(sql, values || [], function (err) {
                    //console.log("执行结果", this)
                    callback(err, this);
                });
            }
        }
    }
        , dbName = "main"
        //, isTrans = false
        ;

    /**
     * 操作的数据库表
     * @param {string} table - 表名
     * @param {string} [database] - 所在数据库
     * @returns Linq
     */
    this.table = function (table, database) {
        return new Linq(database || dbName).table(table).setExector(exector).setLogger(logger);
    }
    /**
     * 执行一条Sql语句
     * @param {string} sql 
     * @param {Array} [values] - sql语句中占位符对应的值
     * @returns object
     */
    this.execute = function (sql, values) {
        return new Promise(function (resolve, reject) {
            exector.query(sql, values, function (error, results, fields) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(results);
                }
            })
        })
    }
    this.Close = function () {
        return new Promise(function (resolve, reject) {
            _db_.close(function (err) {
                if(err){
                    reject(err);
                }
                else{
                    resolve();
                }
            });
        });
    }
    if (!isTrans) {
        delete this.rollback;
        delete this.commit;
    }
    //this.pools = exector;

}
function Open(file, mode, logger,busyTimeout) {
    //console.log("打开文件",file)
    return new Promise(function (resolve, reject) {
        let _db = new sqlite3.Database(file||":memory:", mode || (sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE), function (err) {
            //console.log("打开成功");
            if (err) {
                reject(err);
            }
            else {

                resolve(_db);
            }
        });
    }).then(function (_db) {
        _db.configure("busyTimeout", busyTimeout||3000);
        return new db(_db, logger, false);
    });

}
module.exports = {
    Open: Open,
    Mode:{
        OPEN_READWRITE:sqlite3.OPEN_READWRITE,
        OPEN_READONLY:sqlite3.OPEN_READONLY,
        OPEN_CREATE:sqlite3.OPEN_CREATE
    }
};
module.exports.SqlTable = Linq.SqlTable;
