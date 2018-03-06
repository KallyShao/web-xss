/*
 * @Author: Administrator
 * @Date:   2018-03-06 22:53:35
 * @Last Modified by:   Administrator
 * @Last Modified time: 2018-03-06 22:53:47
 */
const Router = require('koa-router');
const router = new Router({
    prefix: ''
});

const site = require('../controllers/site');

router.all('/*', async function(ctx, next) {
    console.log('enter site.js');
    await next();
});

router.get('/', site.index);
router.get('/post/:id', site.post);
router.post('/post/addComment', site.addComment);


module.exports = router;