const maxExp = 100;
let exp = Number('ds1');
if (!exp) {
  exp = 24;
} else if (exp > maxExp) {
  exp = maxExp;
}

console.log(exp);
