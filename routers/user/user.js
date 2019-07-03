const user = require('koa-router')()

const loginCheck = require('../../middleware/loginCheck')

user.get('/login',async (ctx)=>{
  ctx.body = '登录页面';
});

user.post('/loginAction',async (ctx, next)=>{
  const {username, password} = ctx.request.body
  console.log('username:'+username,'password:'+password)
  console.log(ctx.session)
  ctx.session.username = username
  ctx.session.password = password
});

user.get('/userCenter',loginCheck,async (ctx, next)=>{
  ctx.body = '个人中心';
});
module.exports = user