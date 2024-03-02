var linq = require('../lib/linq');
var sqlTable = linq.SqlTable;

console.log('=====Select========');
var q = new linq('db');
console.log(q.table('tb').where(p => p.x == 1 && p.y == 'ma').select(p => { p.x, p.y }).toSql());
console.log(q.table('tb').where({x:null}).toSql());
console.log('=============');
var db = new linq('db').table('tb').where(p => p.x == 1 && p.y == 7).select(p => p.x);
console.log(new linq('db').table('tb').leftJoin(db).on((q, p) => q.x == p.x).where((q, p) => p.x == 1 && p.y == 7).select(p => { p.x, p.y }).toSql());
console.log('=============');
console.log(new linq('db').table('tb').leftJoin('leftTb', "other").on((q, p) => q.x == p.x).where((q, p) => p.x == 1 && p.y == 7).select(p => { p.x, p.y }).toSql());
console.log('=============');
console.log(new linq('db').table('tb').where(p => p.x == 1 && p.y == 7).orderBy(p => p.x).thenByDescending(p => p.y).select(p => p.x).toSql())
console.log('=============');
console.log(new linq('db').table('tb').where(p => p.x == 1 && p.y == 7).orderBy(p => p.x).thenByDescending(p => p.y).select(p => p.x).skip(5).take(10).toSql())
console.log('=============');
console.log(new linq('db').table(new sqlTable("select a from `b`")).where(p => p.a == 1).toSql())
console.log('=============');
console.log(new linq('db').table(new sqlTable("select a from `b`")).toSql())
console.log('=============');
console.log(new linq('db').table('tb').where(p => p.a == 1).toSql(null, "count"))
console.log('=============');
console.log(new linq('db').table('tb').where({ a: 1 }).toSql())
console.log('=====Update========');
console.log(new linq('db').table('tb').where(p => p.x > 2).toUpdateSql({ x: 3, b: 4 }))
console.log('=============');
console.log(new linq('db').table('tb').where(p => p.x > 2).toUpdateSql(p => { p.x = 3, p.b = 4 },{}))
console.log('=============');
console.log(new linq('db').table('tb').where(p => p.x > 2).toUpdateSql(p => { p.x = y, p.b = 4 }, { y: 11 }))
console.log('=============');
console.log(new linq('db').table('tb').toUpdateSql(p => { p.x = 3, p.b = 4 }))
console.log('=====Insert========');
console.log(new linq('db').table('tb').toInsertSql({ x: 3, b: 4 }))
console.log(new linq('db').table('tb').toInsertSql({ x: 3, b: 4 },{x:2}))
console.log(new linq('db').table('tb').toInsertSql({ x: 3, b: 4 },p=>{p.x=p.x+2,p.y=1+p.y,p.z=m},{m:'值'}))
console.log(new linq('db').table('accounts').toInsertSql({ id:'18216fae-3177-4883-816b-89866a807464' },{updated_at:0},{m:'值'}))
console.log('=====Delete========');
console.log(new linq('db').table('tb').toDeleteSql({ x: 3, b: 4 }));//toDeleteSql无入参，此处的参数会被忽略
console.log('=====Delete========');
console.log(new linq('db').table('tb').toDeleteSql())
console.log('=============');
console.log(new linq('db').table('tb').where(p => p.x > 2).toDeleteSql())
console.log('=============');
console.log(new linq('db').table('tb').where(p => p.x > 2 && p.y < y, { y: 1 }).toDeleteSql())