const koa = require('koa')
const app = new koa()
const bodyparser = require('koa-bodyparser')

const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const morgan = require('koa-morgan')
const logger = require('koa-logger')

const path = require('path')
const fs = require('fs')
// redis 配置
const { REDIS_CONF } = require('./conf/db')

//引入路由
const {userRouter, publicRputer} = require('./routers/routers')

//抛出错误信息
var onerror = require('Koa-onerror');
onerror(app);

//session
app.keys = ['WJiol#23123_']
app.use(session({
    cookie: {
        path: '/',
        httpOnly: true,//无法通过脚本访问
        maxAge:24 * 60 * 60 * 1000
    },
    store: redisStore({
        host: REDIS_CONF.host,
        port: REDIS_CONF.port,
        password: REDIS_CONF.password
    })
}))

app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))


// logger
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
  })
  
//log
const ENV = process.env.NODE_ENV
if (ENV !== 'production') {
    // 开发环境 / 测试环境
    app.use(morgan('dev'));
} else {
    // 线上环境
    const logFileName = path.join(__dirname, 'logs', 'access.log')
    const writeStream = fs.createWriteStream(logFileName, {
        flags: 'a'
    })
    app.use(morgan('combined', {
        stream: writeStream
    }));
}
// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

app.use(publicRputer.routes(), publicRputer.allowedMethods())
app.use(userRouter.routes(), userRouter.allowedMethods())

console.log(app,'app')
module.exports = app