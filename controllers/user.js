/*
 * @Author: Administrator
 * @Date:   2018-03-06 22:51:53
 * @Last Modified by:   Administrator
 * @Last Modified time: 2018-03-09 16:51:39
 */
const bluebird = require('bluebird');
const connectionModel = require('../models/connection');

exports.login = async function(ctx, next) {
    ctx.render('login');
};

exports.doLogin = async function(ctx, next) {
    try {

        const data = ctx.request.body;
        const connection = connectionModel.getConnection();
        const query = bluebird.promisify(connection.query.bind(connection));
        const results = await query(
            `select * from user where
            username = '${data.username}'
            and password = '${data.password}'`
        );
        if (results.length) {
            let user = results[0];

            // 登录成功，设置cookie
            ctx.cookies.set('userId', user.id, {
                httpOnly: false,
                // sameSite: 'strict'
            });

            ctx.body = {
                status: 0,
                data: {
                    id: user.id,
                    name: user.name
                }
            };
        } else {
            throw new Error('登录失败');
        }

        connection.end();
    } catch (e) {
        console.log('[/user/login] error:', e.message, e.stack);
        ctx.body = {
            status: e.code || -1,
            body: e.message
        };
    }
};