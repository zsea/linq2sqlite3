# 介绍

在Nodejs中，使用Linq语法查询Sqlite3数据库。

> 此项目是对linq2mysql的移植。

# 入门

## 安装

```
npm install --save linq2sqlite3
```

## 使用

```javascript
var linq = require('linq2sqlite3');
var db = await linq.Open("db.db")
```
linq.Open方法，一共有三个参数：
* file - 要打开的数据库文件地址，若为空则打开内存数据库（:memory:）
* mode - 打开数据库的选项，可选值为：linq.Mode.OPEN_READWRITE/linq.Mode.OPEN_READONLY/linq.Mode.OPEN_CREATE，默认值为：linq.Mode.OPEN_READWRITE|linq.Mode.OPEN_READONLY|linq.Mode.OPEN_CREATE
* logger - 在执行SQL语句前，调用此回调进行日志记录
* busyTimeout - 繁忙处理的超时时间，默认值：3000

## 查询

### where

查询条件使用```where```方法添加，可以级联多个```where```条件，多个```where```方法调用生成的SQL语句用**AND**进行连接。

```where```参数可以是**lambda**表达式，也可以是一个对象。对象各字段条件用**AND**语句连接，单个```key```转换为```=```。

关于where的更多内容请参考[linq2sql](https://github.com/zsea/linq2sql)。

### 基础查询

```javascript
await db.table("users").where(p=>p.age==0).toArray()
```
### 带变量的查询

```javascript
await db.table("users").where(p=>p.age==age,{age:0}).toArray()
```

### 只返回第一个数据

```javascript
await db.table("users").where(p=>p.age==0).first()
```

### 统计

```javascript
await db.table("users").where(p=>p.age==0).count()
```

### 分页

```javascript
await db.table("users").where(p=>p.age==0).skip(1).take(1).toArray()
```

### 返回指定字段

```javascript
await db.table("users").where(p=>p.age==0).select(p=>{p.age,p.id}).toArray()
```

### 排序

排序共有四个方法：
* orderBy - 升序
* thenBy - 升序
* orderByDescending - 降序
* thenByDescending - 降序

### 连接

支持左连接、右连接、内连接

* leftJoin
* rightJoin
* innerJoin

连接方法返回的对象支持```on```方法，用于添加连接条件；```on```方法返回的对象不再具有```on```方法。

```javascript
await db.table('users').leftJoin('scores').on((p,q)=>p.id==q.userid).where(p=>p.age>=0).select((p,q)=>{
        p.id,
        p.username,
        p.password,
        p.age,
        q.score
    }).toArray();
```
在连接查询中，有些时候只需要返回一个表的所有字段，可以使用```*```来指定，多个表的字段输出，使用```,```分隔。

```javascript
await db.table('users').leftJoin('scores').on((p,q)=>p.id==q.userid).where(p=>p["*"]
    }).toArray();
```

## Insert

```javascript
await db.table('users').insert({
        username:'admin',
        password:'admin888',
        age:39
    })
await db.table('users').insert([{
        username:'admin',
        password:'admin888',
        age:39
    },{
        username:'admin',
        password:'admin888',
        age:39
    }])
```

```insert``` 方法参数可以是一个对象或数组。

## Update

```javascript
await db.table("users").where(p=>p.age==0).update({age:10});
await db.table("scores").where(p=>p.userid==1).update(p=>{
        p.score=p.score+1
    });
```

## Delete

```javascript
await db.table("users").where(p=>p.age==0).delete()
```

## Count

```javascript
var count=await db.table("scores").where(p=>p.userid==1).count();
```

## Exists

判断指定的查询条件是否在数据库中有数据。

```javascript
var exists=await db.table("scores").where(p=>p.userid==1).exists();
```

## SqlTable

在查询的时候，可以使用SQL语句做为一个虚拟表。

```javascript
var items=await db.table(new linq.SqlTable('select * from scores where score>10')).where(p=>p.userid==1).toArray();
```

## 更新或插入对象

在某些时候，我们需要判断指定查询条件的在数据库中是否有值，在有的时候调用更新语句，没有的时候调用写入语句。

```javascript
await db.table("scores").where({ id: 1 }).insertOrUpdate({ userid: 1, score: 50 });
await db.table("scores").where({ id: 1 }).insertOrUpdate({ userid: 1, score: 50 }, function (e, m) {
        return {
            entity: { userid: 1, score: 99 },
            mode: "INSERT"
        }
    })
```

```insertOrUpdate```方法有两入参数，```insertOrUpdate(entity,handler)```

* entity 要插入或更新的对象
* handler 在更新或插入对象前，对对象数据进行处理，```handler```有两个参数```handler(entity,mode)```,```entity```是```insertOrUpdate```方法传入的数据对象，```mode```是将进行的操作```UPDATE```或```INSERT```。返回值是一个对象，有两个属性：```entity```是要插入或更新的对象，```mode```是将要进行的操作，可选值同上。

## db.table

该方法返回一个Linq实例，只有在调用```count```,```insert```,```delete```,```update```,```first```,```toArray```,```exists```,```insertOrUpdate```，才会返回数据，其它方法均返回对象本身。

### 参数

* table - 可以是表名称，SqlTable对象和db.table实例。
* [database] - 指定库名称，默认为链接字符串中指定的库名。

## db.execute

执行sql语句，并返回结果。

```javascript
await db.execute(sql,[values]);
```


# 其它

在最终执行的时```update```,```insert```,```delete```语句时，返回一个对象，其中包含```lastID```与```changes```属性。

```javascript
{ lastID: 11, changes: 1 }
```