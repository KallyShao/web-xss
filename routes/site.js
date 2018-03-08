/*
 * @Author: Administrator
 * @Date:   2018-03-06 22:53:35
 * @Last Modified by:   Administrator
 * @Last Modified time: 2018-03-08 21:38:58
 */
const Router = require('koa-router');
const router = new Router({
    prefix: ''
});

const site = require('../controllers/site');

router.all('/*', async function(ctx, next) {
    console.log('enter site.js');
    // ctx.set('X-XSS-Protection', 0);
    // ctx.set('X-XSS-Protection', 1); //1是打开浏览器防御，0是关闭；
    await next();
});

router.get('/', site.index);
router.get('/post/:id', site.post);
router.post('/post/addComment', site.addComment);


module.exports = router;