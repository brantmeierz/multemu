//Stack pointer register
var SP = 0x0000;

//Program counter register
var PC = 0x0000;

//Accumulator register
var A = 0x00;

//Flag register
var F = 0x00;

var FLAG_Z = 0x80; //Zero          1000 0000
var FLAG_N = 0x40; //Subtract      0100 0000
var FLAG_H = 0x20; //Half carry    0010 0000
var FLAG_C = 0x10; //Carry         0001 0000

function flagSet(flag, value) {
	flag = value === 0 ? F | flag : F & ~flag;
}

function flagOn(flag) {
	F |= flag;	
}

function flagOff(flag) {
	F &= ~flag;	
}

function flagToggle(flag) {
	F ^= flag;
}

function flagZero(num) {
	F = num === 0 ? F | FLAG_Z : F & FLAG_Z;
}

//NEEDS MORE TESTING
//http://stackoverflow.com/questions/8868396/gbz80-what-constitutes-a-half-carry
function flagHalfCarry(num1, num2) {
	F = (num1 & 0x08 == 0x08 && num2 & 0x08 !== 0x08) ? F |= FLAG_H : F &= ~FLAG_H;
}

//Other registers
var B = 0x00; // 0000 0000
var C = 0x00; // 0000 0000
var D = 0x00; // 0000 0000
var E = 0x00; // 0000 0000
var H = 0x00; // 0000 0000
var L = 0x00; // 0000 0000

function BC() { // 0000 0000 0000 0000
	return makeWord(B, C);
}

function DE() { // 0000 0000 0000 0000
	return makeWord(D, E);
}

function HL() { // 0000 0000 0000 0000
	return makeWord(H, L);	
}

//RAM
/*
	8kB-Main
	8kB-Video
	
	Mirrored RAM
	$E000-$FE00 = $C000-$DE00 
	
	32kB cartridge
*/
var RAM = [];

function fetch(byteNum) {
	return RAM[byteNum];
}

function write(address, value) {
	RAM[address] = value;
}

function swap(R) {
	R = ((R & 0x0F) << 4 | (R & 0xF0) >> 4) & 0xFF;	
}

function makeWord(byte1, byte2) {
	return (byte1 << 8) & byte2; 	
}


function startup() {
	PC = 0x0100;
	SP = 0xFFFE;	
}

//1 machine cycle (PC++) = 4 clock cycles (often)
function execute(opcode) {
	
	//var opcode = fetch(PC);
	
	switch (opcode) {
			
		case 0x00: //NOP 
			PC += 1; //Increase PC by 1 byte
			break;
			
		case 0x01:
			B = fetch(PC + 1);
			C = fetch(PC + 2);
		
			PC += 3;
			break;
		
		case 0x02:
		
			break;
		
		case 0x04: //INC B
			B = (B + 1) & 0xFF;
			
			flagZero(B);
			flagOff(FLAG_N);
			flagHalfCarry(B - 1, B);
		
			PC += 1;
			break;
		
		case 0x05: //DEC B  FFLAGGSS 
			B = (B - 1) & 0xFF;
		
			PC += 1;
			break;
			
		case 0x07: //RLCA           FIGUR OUT BIT STUFF
			var bit = A & 0x80;
			A << 1;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagSet(bit);
			
			PC += 1;
			break;
			
		case 0x0F: //RRCA         FIGURE OUT BIT STUFF
			var bit = A & 0x01;
			A >> 1;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagSet(bit);
			
			PC += 1;
			break;
			
		case 0x10: //STOP (technically 10 00)
			//HALT UNTIL BUTTON PRESS
			break;
		
		case 0x14: //INC D    FFLALSSSGGS
			D = (D + 1) & 0xFF;

			PC += 1;
			break;
		
		case 0x15: //DEC D    FLFAAGS
			D = (D - 1) & 0xFF;
		
			PC += 1;
			break;
			
		case 0x1F: //RR A
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagSet(FLAG_C, A & 0x01);
			
			A = (A >> 1) & 0xFF;
			
			PC += 1;
			break;
			
		case 0x24: //INC H    FLFAGGGS
			H = (H + 1) & 0xFF;

			PC += 1;
			break;
		
		case 0x25: //DEC H     FLAAGSS
			H = (H - 1) & 0xFF;
		
			PC += 1;
			break;
			
		case 0x2F: //CPL
			A = A ^ 0xFF;
			
			flagOn(FLAG_N);
			flagOn(FLAG_H);
			
			PC += 1;
			break;
			
		case 0x35: //DEC (HL)
		    write(fetch(HL()) - 1);
		    
		    flagZero(fetch(HL()));
		    flagOn(FLAG_N);
		    //CHECK HALF CARRY
		    flagHalfCarry(fetch(HL()), fetch(HL()) + 1);
		    
		    break;
		
		case 0x37: //SCF
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOn(FLAG_C);
			
			PC += 1;
			break;
			
		case 0x3F: //CCF
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagToggle(FLAG_C);
			
			PC += 1;
			break;
			
		case 0x40: //LD B, B
			B = B;
			
			PC += 1;
			break;
			
		case 0x41: //LD B, C
			B = C;
			
			PC += 1;
			break;
			
		case 0x42: //LD B, D
			B = D;
			
			PC += 1;
			break;
			
		case 0x43: //LD B, E
			B = E;
			
			PC += 1;
			break;
			
		case 0x44: //LD B, H
			B = H;
			
			PC += 1;
			break;
			
		case 0x45: //LD B, L
			B = L;
			
			PC += 1;
			break;
			
		case 0x46: //LD B, (HL)
			B = fetch(HL());
			
			PC += 1;
			break;
			
		case  0x47: //LD B, A
			B = A;
			
			PC += 1;
			break;
			
		case 0x48: //LD C, B
			C = B;
			
			PC += 1;
			break;
			
		case 0x49: //LD C, C
			C = C;
			
			PC += 1;
			break;
			
		case 0x4A: //LD C, D
			C = D;
			
			PC += 1;
			break;
			
		case 0x4B: //LD C, E
			C = E;
			
			PC += 1;
			break;
			
		case 0x4C: //LD C, H
			C = H;
			
			PC += 1;
			break;
			
		case 0x4D: //LD C, L
			C = L;
			
			PC += 1;
			break;
			
		case 0x4E: //LD C, (HL)
			C = fetch(HL());
			
			PC += 1;
			break;
			
		case 0x4F: //LD C, A
			C = A;
			
			PC += 1;
			break;
			
		case 0x50: //LD D, B
			D = B;
			
			PC += 1;
			break;
			
		case 0x51: //LD D, C
			D = C;
			
			PC += 1;
			break;
			
		case 0x52: //LD D, D
			D = D;
			
			PC += 1;
			break;
			
		case 0x53: //LD D, E
			D = E;
			
			PC += 1;
			break;
			
		case 0x54: //LD D, H
			D = H;
			
			PC += 1;
			break;
			
		case 0x55: //LD D, L
			D = L;
			
			PC += 1;
			break;
			
		case 0x56: //LD D, (HL)
			D = fetch(HL());
			
			PC += 1;
			break;
			
		case 0x57: //LD D, A
			D = A;
			
			PC += 1;
			break;
			
		case 0x58: //LD E, B
			E = B;
			
			PC += 1;
			break;
			
		case 0x59: //LD E, C
			E = C;
			
			PC += 1;
			break;
			
		case 0x5A: //LD E, D
			E = D;
			
			PC += 1;
			break;
			
		case 0x5B: //LD E, E
			E = E;
			
			PC += 1;
			break;
			
		case 0x5C: //LD E, H
			E = H;
			
			PC += 1;
			break;
			
		case 0x5D: //LD E, L
			E = L;
			
			PC += 1;
			break;
			
		case 0x5E: //LD E, (HL)
			E = fetch(HL());
			
			PC += 1;
			break;
			
		case 0x5F: //LD E, A
			E = A;
			
			PC += 1;
			break;
			
		case 0x60: //LD H, B
			H = B;
			
			PC += 1;
			break;
			
		case 0x61: //LD H, C
			H = C;
			
			PC += 1;
			break;
			
		case 0x62: //LD H, D
			H = D;
			
			PC += 1;
			break;
			
		case 0x63: //LD H, E
			H = E;
			
			PC += 1;
			break;
			
		case 0x64: //LD H, H
			H = H;
			
			PC += 1;
			break;
			
		case 0x65: //LD H, L
			H = L;
			
			PC += 1;
			break;
			
		case 0x66: //LD H, (HL)
			H = fetch(HL());
			
			PC += 1;
			break;
			
		case 0x67: //LD H, A
			H = A;
			
			PC += 1;
			break;
			
		case 0x68: //LD L, B
			L = B;
			
			PC += 1;
			break;
			
		case 0x69: //LD L, C
			L = C;
			
			PC += 1;
			break;
			
		case 0x6A: //LD L, D
			L = D;
			
			PC += 1;
			break;
		
		case 0x6B: //LD L, E
			L = E;
			
			PC += 1;
			break;
			
		case 0x6C: //LD L, H
			L = H;
			
			PC += 1;
			break;
			
		case 0x6D: //LD L, L
			L = L;
			
			PC += 1;
			break;
			
		case 0x6E: //LD L, (HL)
			L = fetch(HL());
			
			PC += 1;
			break;
			
		case 0x6F: //LD L, A
			L = A;
			
			PC += 1;
			break;
			
		case 0x70: //LD (HL), B
			write(HL(), B);
			
			PC += 1;
			break;
			
		case 0x71: //LD (HL), C
			write(HL(), C);
			
			PC += 1;
			break;
			
		case 0x72: //LD (HL), D
			write(HL(), D);
			
			PC += 1;
			break;
			
		case 0x73: //LD (HL), E
			write(HL(), E);
			
			PC += 1;
			break;
			
		case 0x74: //LD (HL), H
			write(HL(), H);
			
			PC += 1;
			break;
			
		case 0x75: //LD (HL), L
			write(HL(), L);
			
			PC += 1;
			break;
			
		case 0x76: //HALT
			//POWER DOWN CPU UNTIL INTERRUPT
			PC += 1;
			break;
			
		case 0x77: //LD (HL), A
			write(HL(), A);
			
			PC += 1;
			break;
			
		case 0x78: //LD A, B
			A = B;
			
			PC += 1;
			break;
			
		case 0x79: //LD A, C
			A = C;
			
			PC += 1;
			break;
			
		case 0x7A: //LD A, D
			A = D;
			
			PC += 1;
			break;
			
		case 0x7B: //LD A, E
			A = E;
			
			PC += 1;
			break;
			
		case 0x7C: //LD A, H
			A = H;
			
			PC += 1;
			break;
			
		case 0x7D: //LD A, L
			A = L;
			
			PC += 1;
			break;
			
		case 0x7E: //LD A, (HL)
			A = fetch(HL());
			
			PC += 1;
			break;
			
		case 0x7F: //LD A, A
			A = A;
			
			PC += 1;
			break;
			
		case 0x80: //ADD A, B
			A = (A + B) & 0xFF;
			
			flagZero(A);
			flagOff(FLAG_N);
			/**
				CHECK FOR NEXT TWO FLAGS
			*/
			
			PC += 1;
			break;
		
		case 0xA0: //AND B
			A = B & A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOn(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xA1: //AND C
			A = C & A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOn(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xA2: //AND D
			A = D & A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOn(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xA3: //AND E
			A = E & A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOn(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xA4: //AND H
			A = H & A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOn(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xA5: //AND L
			A = L & A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOn(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xA6: //AND (HL) XXXXXXXXXXXXXX
			A = fetch(HL()) & A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOn(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xA7: //AND A
			A = A & A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOn(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xA8: //XOR B
			A = B ^ A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xA9: //XOR C
			A = C ^ A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xAA: //XOR D
			A = D ^ A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xAB: //XOR E
			A = E ^ A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xAC: //XOR H
			A = H ^ A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xAD: //XOR L
			A = L ^ A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
		
		case 0xAE: //XOR (HL)    XXXXXXX
			//A = B ^ A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xAF: //XOR A
			A = A ^ A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xB0: //OR B
			A = B | A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xB1: //OR C
			A = C | A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xB2: //OR D
			A = D | A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xB3: //OR E
			A = E | A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xB4: //OR H
			A = H | A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xB5: //OR L
			A = L | A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xB6: //OR (HL) XXXXXXXXXx
			//B = B | A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
			
		case 0xB7: //OR A
			A = A | A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 1;
			break;
		
		case 0xCB: //CB prefix
			PC += 1;
			
			switch (fetch(PC)) {
				
				case 0x00:
					
					break;
				
				case 0x30: //SWAP B
					B = swap(B);
					flagZero(B);
					flagOff(FLAG_N);
					flagOff(FLAG_H);
					flagOff(FLAG_C);
					
					PC += 1;
					break;
					
				case 0x31: //SWAP C
					C = swap(C);
					flagZero(C);
					flagOff(FLAG_N);
					flagOff(FLAG_H);
					flagOff(FLAG_C);
					
					PC += 1;
					break;
					
				case 0x32: //SWAP D
					D = swap(D);
					
					flagZero(D);
					flagOff(FLAG_N);
					flagOff(FLAG_H);
					flagOff(FLAG_C);
					
					PC += 1;
					break;
					
				case 0x33: //SWAP E
					E = swap(E);
					
					flagZero(E);
					flagOff(FLAG_N);
					flagOff(FLAG_H);
					flagOff(FLAG_C);
					
					PC += 1;
					break;
					
				case 0x34: //SWAP H
					H = swap(H);
					
					flagZero(H);
					flagOff(FLAG_N);
					flagOff(FLAG_H);
					flagOff(FLAG_C);
					
					PC += 1;
					break;
					
				case 0x35: //SWAP L
					L = swap(L);
					
					flagZero(L);
					flagOff(FLAG_N);
					flagOff(FLAG_H);
					flagOff(FLAG_C);
					
					PC += 1;
					break;
					
				case 0x36: //SWAP (HL) Memory address referenced by HL
					//memWrite(fetch(HL()), swap(fetch(HL())));
					flagZero(fetch(HL()));
					flagOff(FLAG_N);
					flagOff(FLAG_H);
					flagOff(FLAG_C);
					
					PC += 1; //???
					break;
					
				case 0x37: //SWAP A
					A = swap(A);
					
					flagZero(A);
					flagOff(FLAG_N);
					flagOff(FLAG_H);
					flagOff(FLAG_C);
					
					PC += 1;
					break;
				
				default: 
					console.log("Unrecognized CB-prefixed opcode: " + fetch(PC));
					PC += 1;
					break;
					
			}
		
			break;
			
		case 0xEE: //XOR {n}
			A = fetch(PC + 1) ^ A;
			
			flagZero(A);
			flagOff(FLAG_N);
			flagOff(FLAG_H);
			flagOff(FLAG_C);
			
			PC += 2;
			break;
			
		default:
			PC += 1;
			console.log("Unrecognized opcode: " + opcode.toString(16));
			break;
			
	}
}

function run() {
	execute(fetch(PC));
}