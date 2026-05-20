import { createPool } from "mysql2/promise";
import '../utils/env.js'


//  export const pool = createPool({
//      host: process.env.HOST_DEV,
//      user: process.env.USER_DEV ,
//      password: process.env.PASSWORD_DEV,
//      database: process.env.DATABASE_DEV
//  })

export const pool = createPool({
   // // // //  //'mysql://ue6lzi4rzrwbgeew:p3DNp4j6ogym2GBpeY9n@blj394itpypibv4ybum6-mysql.services.clever-cloud.com:3306/blj394itpypibv4ybum6' -> CLEVER
   //uri:'mysql://root:ezhOhvAzRKHMePpLeQrTysKoutsQjnqQ@interchange.proxy.rlwy.net:29405/railway', //-> RAILWAY DEV
   uri: process.env.URI_MYSQL_PRD,
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0,
   enableKeepAlive: true,
   keepAliveInitialDelay: 0,
   connectTimeout: 30000
});

export default pool;
