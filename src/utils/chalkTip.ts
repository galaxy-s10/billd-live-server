import nodeChalk from 'chalk';
import nodeEmoji from 'node-emoji';

export const emoji = nodeEmoji;
export const chalk = nodeChalk;
export const chalkINFO = (v) =>
  `${chalk.bgBlueBright.black(
    `[${new Date().toLocaleString()}]  INFO   `
  )} ${chalk.blueBright(v)}`;
export const chalkSUCCESS = (v) =>
  `${chalk.bgGreenBright.black(
    `[${new Date().toLocaleString()}] SUCCESS `
  )} ${chalk.greenBright(v)}`;
export const chalkERROR = (v) =>
  `${chalk.bgRedBright.black(
    `[${new Date().toLocaleString()}]  ERROR  `
  )} ${chalk.redBright(v)}`;
export const chalkWARN = (v) =>
  `${chalk
    .bgHex('#FFA500')
    .black(`[${new Date().toLocaleString()}]  WARN   `)} ${chalk.hex('#FFA500')(
    v
  )}`;
