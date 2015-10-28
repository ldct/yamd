#!/usr/bin/env python3

def decode_execute(instruction, prev_is_lis=False):
    d, s, t = (instruction >> 11) & 0b11111, (instruction >> 21) & 0b11111, (instruction >> 16) & 0b11111
    i = instruction & 0b1111111111111111
    if i & 0x8000: i -= 0x10000 # make sure we interpret the value as a signed 16 bit integer

    if prev_is_lis:
        return str(instruction)

    if instruction & 0b11111100000000000000011111111111 == 0b00000000000000000000000000100000: # add (add)
        return "add $%d $%d $%d" % (d, s, t)
    elif instruction & 0b11111100000000000000011111111111 == 0b00000000000000000000000000100010: # subtract (sub)
        return "sub $%d $%d $%d" % (d, s, t)
    elif instruction & 0b11111100000000001111111111111111 == 0b00000000000000000000000000011000: # multiply (mult)
        return ("mult ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    elif instruction & 0b11111100000000001111111111111111 == 0b00000000000000000000000000011001: # multiply unsigned (multu)
        return ("multu ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    elif instruction & 0b11111100000000001111111111111111 == 0b00000000000000000000000000011010: # divide (div)
        return ("div ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    elif instruction & 0b11111100000000001111111111111111 == 0b00000000000000000000000000011011: # divide unsigned (divu)
        return ("divu ${}, ${}".format(s, t), "${}={}, ${}={}".format(s, r[s], t, r[t]))
    elif instruction & 0b11111111111111110000011111111111 == 0b00000000000000000000000000010000: # move from high/remainder (mfhi)
        return ("mfhi ${}".format(d))
    elif instruction & 0b11111111111111110000011111111111 == 0b00000000000000000000000000010010: # move from low/quotient (mflo)
        return ("mflo ${}".format(d), "${}={}".format(d, r[d]))
    elif instruction & 0b11111111111111110000011111111111 == 0b00000000000000000000000000010100: # load immediate and skip (lis)
        return ("lis $%d" % (d))
    elif instruction & 0b11111100000000000000000000000000 == 0b10001100000000000000000000000000: # load word (lw)
        return "lw $%d, %d($%d)" % (t, i, s)
    elif instruction & 0b11111100000000000000000000000000 == 0b10101100000000000000000000000000: # store word (sw)
        return "sw $%d, %d($%d)" % (t, i, s)
    elif instruction & 0b11111100000000000000011111111111 == 0b00000000000000000000000000101010: # set less than (slt)
        return "slt $%d $%d $%d" % (d, s, t)
    elif instruction & 0b11111100000000000000011111111111 == 0b00000000000000000000000000101011: # set less than unsigned (sltu)
        return ("sltu ${}, ${}, ${}".format(d, s, t), "${}={}, ${}={}, ${}={}".format(d, r[d], s, r[s], t, r[t]))
    elif instruction & 0b11111100000000000000000000000000 == 0b00010000000000000000000000000000: # branch on equal (beq)
        return "beq $%d $%d %d" % (s, t, i)
    elif instruction & 0b11111100000000000000000000000000 == 0b00010100000000000000000000000000: # branch on not equal (bne)
        return "bne $%d $%d %d" % (s, t, i)
    elif instruction & 0b11111100000111111111111111111111 == 0b00000000000000000000000000001000: # jump register (jr)
            return "jr $%d" % s
    elif instruction & 0b11111100000111111111111111111111 == 0b00000000000000000000000000001001: # jump and link register (jalr)
            return "jalr $%d" % s
    else:
        return str(instruction)

def decode_str(s):
    s = s.split(",")
    return [int(x, 2) for x in s]

with open("mips.mc") as f:
    asm = f.read()

prev_is_lis = False
for i, inst in enumerate(decode_str(asm)):
    decoded = decode_execute(inst, prev_is_lis)
    print('{0: >2} {1}'.format(i, decoded))
    prev_is_lis = isinstance(decoded, str) and decoded.startswith("lis")