/*
 * @Author: Administrator
 * @Date:   2018-03-06 22:42:18
 * @Last Modified by:   Administrator
 * @Last Modified time: 2018-03-06 22:43:07
 */
const mysql = require('mysql');
exports.getConnection = function() {
    let connection = mysql.createConnection({
        host: 'localhost',
        database: 'safety',
        user: 'root',
        password: '123456',
        port: 3306
    });
    connection.connect();
    return connection;
};