function asyncfn(delay = 1000) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve('iiiiii');
    }, delay);
  });
}
async function midw1(next) {
  console.log('from midw1 前');
  await next();
  console.log('from midw1 后');
}
// 中间件midw2
async function midw2(next) {
  console.log('from midw2 前');
  await next();
  let res = await asyncfn();
  console.log(res, 'ress');
  console.log('from midw2 后');
}

function processtest() {
  console.log('from core processtest');
}

// 中间件midw3
async function midw3(next) {
  console.log('from midw3 前');
  await next();
  console.log('from midw3 后');
}

class AppD {
  midware = [];
  use(fn) {
    if (typeof fn === 'function') {
      this.midware.push(fn);
    } else {
      throw new Error('fn必须是函数');
    }
  }
}

const app = new AppD();

app.use(midw1);
app.use(midw2);
app.use(processtest);
app.use(midw3);

function compose2(midwareArr) {
  let index = -1;
  function dispatch(i) {
    if (i <= index) {
      return Promise.reject(new Error('next() called multiple times'));
    }
    index = i;
    let fn = midwareArr[i];
    if (!fn) {
      return Promise.resolve();
    }
    return Promise.resolve(
      fn(function () {
        return dispatch(i + 1);
      })
    );
  }
  return dispatch(0);
}

function compose(midwareArr) {
  let flag = [];
  function dispatch(i) {
    let fn = midwareArr[i];
    if (!fn) {
      return Promise.resolve();
    }
    if (flag[i]) {
      return Promise.reject('next 只能用一次');
    }
    flag[i] = 1;
    return Promise.resolve(
      fn(function () {
        return dispatch(i + 1);
      })
    );
  }
  return dispatch(0);
}

compose(app.midware);

// from midw1 前
// from midw2 前
// TypeError: next is not a function

// console.log(app.midware);
