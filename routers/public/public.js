const public = require('koa-router')()
public.get('/',async (ctx)=>{
  ctx.body = '首页';
});
module.exports = public