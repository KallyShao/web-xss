/*
 * @Author: Administrator
 * @Date:   2018-03-06 22:53:55
 * @Last Modified by:   Administrator
 * @Last Modified time: 2018-03-06 22:54:05
 */

const Router = require('koa-router');
const router = new Router({
    prefix: '/user'
});

const user = require('../controllers/user');

/*router.all('/*', async function(ctx, next){
    await next();
});*/

router.get('/login', user.login);
router.post('/login', user.doLogin);

module.exports = router;