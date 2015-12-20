"use strict";

let assert = require('assert');
let cpu = require('./cpu');

/************* 0000 00ss ssst tttt dddd d000 0000 0000 */
let addInst = "0000 0000 0100 0001 0001 1000 0010 0000".replace(/ /g, "");
let subInst = "0000 0000 0100 0001 0001 1000 0010 0010".replace(/ /g, "");

var state;

state = cpu.getInitialState(1, 2, [addInst]);
assert(cpu.unsigned(cpu.step(state).registers[3]) == 3);

state = cpu.getInitialState(1, 2, [subInst]);
assert(cpu.unsigned(cpu.step(state).registers[3]) == 1);