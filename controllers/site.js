/*
 * @Author: Administrator
 * @Date:   2018-03-06 22:51:26
 * @Last Modified by:   Administrator
 * @Last Modified time: 2018-03-09 13:45:18
 */
const bluebird = require('bluebird');
const connectionModel = require('../models/connection');

//防御Html内容节点攻击有2种方法，一是在写入数据库前将Html标签进行转义；
//二是在输出前进行转义；这里采用二!!!
//定义一个函数，转义HTML标签
// var escapeHtml = function(str) {
//     if (!str) return '';
//     str = str.replace(/</g, '&lt;'); //替换为Html实体
//     str = str.replace(/>/g, '&gt;');
//     return str;
// };

//转义html属性，转义", '
// var escapeHtmlProperty = function(str) {
//     if (!str) return '';
//     str = str.replace(/"/g, '&quto;');
//     str = str.replace(/'/g, '&#39;');
//     str = str.replace(/ /g, '&#32;');
//     return str;
// };

//合并转义内容和属性的函数
var escapeHtml = function(str) {
    if (!str) return '';
    str = str.replace(/&/g, '&amp;'); //放到最前面
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quto;');
    str = str.replace(/'/g, '&#39;');
    // str = str.replace(/ /g, '&#32;'); //合并之后对空格不做转义，但是属性要带引号
    return str;
};

//转义js
// var escapeForJs = function(str) {
//     if (!str) return '';
//     str = str.replace(/\\/g, '\\\\');
//     str = str.replace(/"/g, '\\"');
//     return str;
// }

exports.index = async function(ctx, next) {
    const connection = connectionModel.getConnection();
    const query = bluebird.promisify(connection.query.bind(connection));
    const posts = await query(
        'select post.*,count(comment.id) as commentCount from post left join comment on post.id = comment.postId group by post.id limit 10'
    );
    const comments = await query(
        'select comment.*,post.id as postId,post.title as postTitle,user.username as username from comment left join post on comment.postId = post.id left join user on comment.userId = user.id order by comment.id desc limit 10'
    );
    ctx.render('index', {
        posts,
        comments,
        //在会出现html内容的地方调用对应的处理函数
        from: escapeHtml(ctx.query.from) || '',
        fromForJs: JSON.stringify(ctx.query.from),
        avatarId: escapeHtml(ctx.query.avatarId) || ''
    });
    connection.end();
};

//在富文本输出前做过滤,即黑名单方案，但是不彻底
// var xssFilter = function(html) {
//     if (!html) return '';
//     html = html.replace(/<\s*\/?script\s*>/g, ''); //过滤script标签
//     html = html.replace(/javascript:[^'"']*/g, ''); //过滤
//     return html;
// }

//使用白名单保留部分标签和属性
// var xssFilter = function(html) {
//     if (!html) return '';
//     var cheerio = require('cheerio'); //使用cheerio是为了将Html解析成dom树，这是由白名单的实现原理决定的
//     var $ = cheerio.load(html);

//     //白名单
//     var whiteList = {
//         'img': ['src'],
//         'font': ['color', 'size'],
//         'a': ['href']
//     };

//     $('*').each(function(index, elem) {
//         // console.log('this is elem:' + elem);
//         //过滤白名单中不存在的元素
//         if (!whiteList[elem.name]) {
//             $(elem).remove();
//             //这里可以选择是否保存script标签内部的内容
//             return;
//         }
//         //过滤白名单中不存在的属性
//         for (var attr in elem.attribs) {
//             if (whiteList[elem.name].indexOf(attr) === -1) {
//                 $(elem).attr(attr, null);
//             }
//         }
//     });
//     return $.html();
// }

//使用第三方插件js-xss

// var xssFilter = function(html) {
//     // var html = filterXSS('<script>alert("xss");</scr' + 'ipt>');
//     // console.log(html);

//     if (!html) return '';
//     var xss = require('xss');
//     var ret = xss(html, {
//         whiteList: {
//             img: ['src'],
//             a: ['href'],
//             font: ['size', 'color']
//         },
//         onIgnoreTag: function() {
//             // .....具体的可查看文档
//         }
//     });

//     return ret;
// };


exports.post = async function(ctx, next) {
    try {
        console.log('enter post');

        const id = ctx.params.id;
        const connection = connectionModel.getConnection();
        const query = bluebird.promisify(connection.query.bind(connection));
        const posts = await query(
            `select * from post where id = "${id}"`
        );
        let post = posts[0];

        const comments = await query(
            `select comment.*,user.username from comment left join user on comment.userId = user.id where postId = "${post.id}" order by comment.createdAt desc`
        );
        comments.forEach(function(comment) {
            // comment.content = xssFilter(comment.content);
            comment.content = comment.content;
        });
        if (post) {
            ctx.render('post', {
                post,
                comments,
                // from: escapeHtml(ctx.query.from) || '',
                // avatarId: ctx.query.avatarId || ''
            });
        } else {
            ctx.status = 404;
        }
        connection.end();
    } catch (e) {
        console.log('[/site/post] error:', e.message, e.stack);
        ctx.body = {
            status: e.code || -1,
            body: e.message
        };
    }
};

exports.addComment = async function(ctx, next) {
    try {
        const data = ctx.request.body;
        const connection = connectionModel.getConnection();
        const query = bluebird.promisify(connection.query.bind(connection));
        const result = await query(
            `insert into comment(userId,postId,content,createdAt) values("${ctx.cookies.get('userId')}", "${data.postId}", "${data.content}",${connection.escape(new Date())})`
        );
        if (result) {
            ctx.redirect(`/post/${data.postId}`);
        } else {
            ctx.body = 'DB操作失败';
        }
    } catch (e) {
        console.log('[/site/addComment] error:', e.message, e.stack);
        ctx.body = {
            status: e.code || -1,
            body: e.message
        };
    }
};