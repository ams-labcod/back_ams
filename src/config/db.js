import { createPool } from "mysql2/promise";
import '../utils/env.js'

// export const pool = createPool({
//     host: process.env.MYSQL_ADDON_HOST,
//     user: process.env.MYSQL_ADDON_USER,
//     password: process.env.MYSQL_ADDON_PASSWORD,
//     database: process.env.MYSQL_ADDON_DB,
//     URL: process.env.MYSQL_ADDON_URI
// })
export const pool = createPool(
  'mysql://ue6lzi4rzrwbgeew:p3DNp4j6ogym2GBpeY9n@blj394itpypibv4ybum6-mysql.services.clever-cloud.com:3306/blj394itpypibv4ybum6'
);

export default pool;