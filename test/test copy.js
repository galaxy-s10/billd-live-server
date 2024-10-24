const Koa = require('koa');

const app = new Koa();

function asyncfn(delay = 1000) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve('iiiiii');
    }, delay);
  });
}
async function midw1(ctx, next) {
  console.log('from midw1 前');
  const start = +new Date();
  console.log(start, 'midw1midw1');
  await asyncfn();
  await next();
  console.log(+new Date() - start, 'midw1midw1--');
  console.log('from midw1 后');
  // next();
  // console.log('from midw1 后ddd');
}
// 中间件midw2
async function midw2(ctx, next) {
  console.log('from midw2 前');
  const start = +new Date();
  console.log(start, 'midw2midw2');
  const res = await asyncfn(100);
  await next();
  console.log(+new Date() - start, 'midw2midw2');
  console.log(res, 'ress');
  console.log('from midw2 后');
}

function processtest(ctx, next) {
  console.log('from core processtest');
}

// 中间件midw3
async function midw3(ctx, next) {
  console.log('from midw3 前');
  await next();
  console.log('from midw3 后');
}

app.use(midw1);
app.use(midw2);
app.use(processtest);
app.use(midw3);

app.use(async (ctx, next) => {
  ctx.body = 'Hello, Koa';
});

app.listen(4300);
