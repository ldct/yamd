# yamd

http://yamd.xuanji.li/

Yet Another MIPS Debugger

![screenshot](https://s3.amazonaws.com/xuanji.public/yamd_screenshot.PNG)

### Why?

I had to write parts of a compiler for CS241E. The target language, LACS, is pretty complex (recursion, heap-allocated closures, GC), necessitating in particular lots of runtime pointer chasing. Staring at the generated machine code is a terrible way to debug the compiler, I and wrote many bugs.

### Usage

Copy and paste your program into the text box beside the "load" button. Your program should be represented as a single line of comma-separated words, where each word is a MIPS instruction encoded as a binary string (hence 32 characters wide). Click "load". You will see 3 columns

- Registers and Program Counter, on the left
- High Memory, in the middle
- Low Memory, on the right

Although there is no actual division between high and low memory in hardware, in CS241E code is loaded starting from address 0 and the stack is placed at the highest possible address. Your code should appear in low memory (annotated with a version decoded into assembly).

Click step forward to execute one instruction and step backwards to undo.

Click on a memory cell to toggle the colour (in the screenshot, I use this to identify stack frames as well as stack-allocated closures). You may drag over multiple memory cells to group them together; clicking on a grouped cell will change its colour and set the colour of all cells in the same group to the same value

### MIPs dialcet

We use Waterloo MIPS as defined in https://www.student.cs.uwaterloo.ca/~cs241e/current/mipsref.pdf. This is not actually implemented in any piece of hardware; it seems the LIS (load immediate and skip) instruction does not exist in any "real" MIPS dialects.

Due to lazyness, some instructions are not supported; these are listed in https://github.com/zodiac/yamd/blob/master/src/cpu.js and will log an error to the console if encountered.
