/*
 * @Author: Administrator
 * @Date:   2018-03-07 14:05:18
 * @Last Modified by:   Administrator
 * @Last Modified time: 2018-03-09 16:40:48
 */
var formSerialize = require('form-serialize');
var axios = require('axios');
var modal = require('./ui/modal');

var $form = document.querySelector('[name=loginForm]');

$form.addEventListener('submit', (e) => {
	e.preventDefault();
	let data = formSerialize($form, {
		hash: true
	});

	axios.post('/user/login', data).then((data) => {
		if (data.status === 200 && data.data.status === 0) {
			// location.href = '/';
			console.log('登录成功');
		} else {
			modal.show({
				content: '登录失败'
			});
			console.log('登录失败');
		}
	});

	console.log('form submit', data);

});