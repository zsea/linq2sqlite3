const Linq = require("../lib/");
async function main() {
    //console.log("开始运行...")
    let db=await Linq.Open(null,null,function(sql,values){
        //console.log(sql,values);
    });
    await db.execute(`CREATE TABLE IF NOT EXISTS  "t" (
        "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT
      );`)
    let add=await db.table("t").insert({name:"曾大海ss"});
    console.log("写入结果",add);
    let data=await db.table("t").where(p=>p.id!=3).toArray()
    console.log("查询结果",data);
    process.exit();
}
main();
//main();
//main();
//main();