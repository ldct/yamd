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
    }
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 == 0b00000000000000000000000000100010) {
        return format("sub $%s $%s $%s", d, s, t)
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 == 0b00000000000000000000000000011000) {
        return "mult"
        return ("mult ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011001) {
        return "multu"
        return ("multu ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011010) {
        return "div"
        return ("div ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    }
    else if ((instruction & 0b11111100000000001111111111111111) >>> 0 === 0b00000000000000000000000000011011) {
        return "divu"
        return ("divu ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010000) {
        return "mfhi"
        return format("mfhi $%s", d)
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010010) {
        return "mflo"
        return ("mflo ${}".format(d), "${}={}".format(d, r[d]))
    }
    else if ((instruction & 0b11111111111111110000011111111111) >>> 0 === 0b00000000000000000000000000010100) {
        return format("lis $%s", d)
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10001100000000000000000000000000) {
        return format("lw $%s, %s($%s)", t, i, s);
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b10101100000000000000000000000000) {
        return format("sw $%s, %s($%s)", t, i, s)
    }
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101010) {
        return "slt"
        return "slt $%d $%d $%d" % (d, s, t)
    }
    else if ((instruction & 0b11111100000000000000011111111111) >>> 0 === 0b00000000000000000000000000101011) {
        return "sltu"
        return ("sltu ${}, ${}, ${}".format(d, s, t), "${}={}, ${}={}, ${}={}".format(d, r[d], s, r[s], t, r[t]))
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010000000000000000000000000000) {
        return "beq"
        return "beq $%d $%d %d" % (s, t, i)
    }
    else if ((instruction & 0b11111100000000000000000000000000) >>> 0 === 0b00010100000000000000000000000000) {
        return "bne"
        return "bne $%d $%d %d" % (s, t, i)
    }
    else if ((instruction & 0b11111100000111111111111111111111) >>> 0 == 0b00000000000000000000000000001000) {
        return format("jr $%s", s);
    }
    else if ((instruction & 0b11111100000111111111111111111111) >>> 0 == 0b00000000000000000000000000001001) {
        return format("jalr $%s", s);
    }
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
