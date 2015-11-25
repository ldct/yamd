var format = function (s) {
  function helper(s, args) {
    if (args.length === 0) {
      return s;
    } else {
      return helper(s.replace("%s", args[0]), args.slice(1));
    }
  }
  return helper(s, Array.prototype.slice.call(arguments).slice(1));
}

var decode_execute = function (instruction, prev_is_lis) {

    prev_is_lis = prev_is_lis || false;

    var d, s, t;

    var d = (instruction >> 11) & 0b11111
    var s = (instruction >> 21) & 0b11111
    var t = (instruction >> 16) & 0b11111

    i = instruction & 0b1111111111111111

    if (i & 0x8000) {
        i -= 0x10000
    }

    if (prev_is_lis) {
        return instruction.toString(); // return numerical value of inst
    }

    if ((instruction & 0b11111100000000000000011111111111) >>> 0 == 0b00000000000000000000000000100000) {
        return format("add $%s $%s $%s", d, s, t);
    } // add (add)
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 == 0b00000000000000000000000000100010) {
        return format("sub $%s $%s $%s", d, s, t)
    } // subtract (sub)
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 == 0b00000000000000000000000000011000) {
        return ("mult ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    } // multiply (mult)
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011001) {
        return ("multu ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    } // multiply unsigned (multu)
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011010) {
        return ("div ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    } // divide (div)
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011011) {
        return ("divu ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    } // divide unsigned (divu)
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010000) {
        return format("mfhi $%s", d)
    } // move from high/remainder (mfhi)
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010010) {
        return ("mflo ${}".format(d), "${}={}".format(d, r[d]))
    } // move from low/quotient (mflo)
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010100) {
        return format("lis $%s", d)
    } // load immediate and skip (lis)
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10001100000000000000000000000000) {
        return format("lw $%s, %s($%s)", t, i, s);
    } // load word (lw)
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10101100000000000000000000000000) {
        return format("sw $%s, %s($%s)", t, i, s)
    } // store word (sw)
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101010) {
        return "slt $%d $%d $%d" % (d, s, t)
    } // set less than (slt)
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101011) {
        return ("sltu ${}, ${}, ${}".format(d, s, t), "${}={}, ${}={}, ${}={}".format(d, r[d], s, r[s], t, r[t]))
    } // set less than unsigned (sltu)
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010000000000000000000000000000) {
        return "beq $%d $%d %d" % (s, t, i)
    } // branch on equal (beq)
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010100000000000000000000000000) {
        return "bne $%d $%d %d" % (s, t, i)
    } // branch on not equal (bne)
    else if ((instruction & 0b11111100000111111111111111111111) >>> 0 == 0b00000000000000000000000000001000) {
        return format("jr $%s", s);
    } // jump register (jr)
    else if ((instruction & 0b11111100000111111111111111111111) >>> 0 == 0b00000000000000000000000000001001) {
        return format("jalr $%s", s);
    } // jump and link register (jalr)
    else {
        return instruction.toString();
    }

}

var fs = require('fs')

fs.readFile('mips.mc', 'utf-8', function (err, res) {
    var instructions = res.split(', ').map(function (inst) {
        inst = parseInt(inst.replace(/\n/g, ''), 2);
        return inst;
    });

    prev_is_lis = false
    for (var i=0; i<instructions.length; i++) {
        var inst = instructions[i];
        decoded = decode_execute(inst, prev_is_lis)
        console.log(decoded)
        prev_is_lis = decoded.slice && decoded.slice(0, 3) === "lis";
    }
});

console.log(decode_execute(8));
