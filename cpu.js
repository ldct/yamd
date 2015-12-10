var zeroPad = function (num, places, radix) {
  places = places || 32;
  radix = radix || 2;
  var zero = places - num.toString(radix).length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num.toString(radix);
}

var spacePad = function (num, places, radix) {
  places = places || 32;
  radix = radix || 2;
  var zero = places - num.toString(radix).length + 1;
  return Array(+(zero > 0 && zero)).join(" ") + num.toString(radix);
}

var Reg = {
  'savedPC': 31,
  'stackPointer': 30,
  'framePointer': 29,
  'heapPointer': 28,
  'semiSpaceTop': 27,
  'input1': 1,
  'input2': 2,
  'result': 3,
  'scratch': 4,
  'savedParamPtr': 5,
  'allocated': 6,
  'copyChunkScratch': 7,
  'targetPC': 8,
  'scratchPtrForGC': 9
}

var terminationPC = "11111110111000011101111010101101";
var maxAddr = "00000001000000000000000000000000";
var printAddr = "11111111111111110000000000001100";


// var fs = require('fs');

var step = function (state) {

  var instruction = parseInt(state.memory[parseInt(state.PC, 2)], 2);

  var d = (instruction >> 11) & 0b11111
  var s = (instruction >> 21) & 0b11111
  var t = (instruction >> 16) & 0b11111

  var i = instruction & 0b1111111111111111

  if (i & 0x8000) {
    i -= 0x10000
  }

  state.PC = zeroPad(parseInt(state.PC, 2) + 4);

  if ((instruction & 0b11111100000000000000011111111111) >>> 0 == 0b00000000000000000000000000100000) {
    // ADD
    var r = state.registers;
    state.registers[d] = zeroPad(parseInt(r[s], 2) + parseInt(r[t], 2));
    return state;
  }
  else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000100010) {
    // SUB
    var r = state.registers;
    state.registers[d] = zeroPad(parseInt(r[s], 2) - parseInt(r[t], 2));
    return state;
  }
  else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011000) {
    // return `mult $${s}} $${t}`
    throw "not supported";
  }
  else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011001) {
    // return `multu $${s}} $${t}`
    throw "not supported";
  }
  else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011010) {
    // return `div $${s}} $${t}`
    throw "not supported";
  }
  else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011011) {
    // return `divu $${s}} $${t}`
    throw "not supported";
  }
  else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010000) {
    // return `mfhi $${d}}`
    throw "not supported";
  }
  else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010010) {
    // return `mflo $${d}}`
    throw "not supported";
  }
  else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010100) {
    // LIS
    state.registers[d] = state.memory[parseInt(state.PC, 2)]
    state.PC = zeroPad(parseInt(state.PC, 2) + 4);
    return state;
  }
  else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10001100000000000000000000000000) {
    // return `lw $${t}, ${i}($${s})`
    state.registers[t] = state.memory[i + parseInt(state.registers[s], 2)];
    return state;
  }
  else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10101100000000000000000000000000) {
    // return `sw $${t}, ${i}($${s})`
    state.memory[i + parseInt(state.registers[s], 2)] = state.registers[t];
    return state;
  }
  else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101010) {
    // return `slt $${d} $${s} $${t}`
    throw "not supported";
  }
  else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101011) {
    // return `sltu $${d} $${s} $${t}`
    throw "not supported";
  }
  else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010000000000000000000000000000) {
    // return `beq $${s}} $${t} ${i}`
    throw "not supported";
  }
  else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010100000000000000000000000000) {
    // return `bne $${s}} $${t} ${i}`
    throw "not supported";
  }
  else if ((instruction & 0b11111100000111111111111111111111) >>> 0 === 0b00000000000000000000000000001000) {
    // return `jr $${s}}`
    state.PC = state.registers[s];
    return state;
  }
  else if ((instruction & 0b11111100000111111111111111111111) >>> 0 === 0b00000000000000000000000000001001) {
    // return `jalr $${s}}`
    var tmp = state.registers[s];
    state.registers[31] = state.PC;
    state.PC = tmp;
    return state;
  }
  else {
    throw "unknown instruction", instruction;
  }

}

var getInitialState = function (input1, input2, program) {
  input1 = input1 || 1;
  input2 = input2 || 2;
  program = program || [];
  var initialState = {
    PC: "00000000000000000000000000000000",
    LO: "00000000000000000000000000000000",
    HI: "00000000000000000000000000000000",
    registers: [],
    memory: {}
  }
  for (var i = 0; i < 30; i++) {
    initialState.registers[i] = "00000000000000000000000000000000";
  }
  initialState.registers[1] = zeroPad(input1);
  initialState.registers[2] = zeroPad(input2);
  initialState.registers[30] = "00000001000000000000000000000000";
  initialState.registers[31] = "11111110111000011101111010101101";

  program.forEach(function (instruction, i) {
    initialState.memory[i * 4] = instruction;
  });

  return initialState;
}

var executeInstructionString = function (instructionString) {

    var instructions = instructionString.split(', ').map(function (value) {
      return value.replace(/\n/g, '').replace(/\r/g, '');
    });

    var ret = [];

    var state = getInitialState(1, 2, instructions);
    while (state.PC !== terminationPC) {

      var PC_value = parseInt(state.PC, 2) / 4;
      var reg3_value = parseInt(state.registers[3], 2);
      var reg29_value = parseInt(state.registers[29], 2);

      ret.push(JSON.stringify(state));

      // console.log(`PC: ${PC_value} $3: ${reg3_value} $29: ${reg29_value}`);
      state = step(state);
    }

    ret.push(JSON.stringify(state));

    return ret.map(JSON.parse);

}

// execute_file('VarAccessN=2.mc');