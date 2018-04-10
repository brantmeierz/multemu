/*

Game Boy (1989)
CPU:     8-bit LR35902 
Display: 160x144 pixels LCD, 59.7 frames
Inputs:  A, B, Select, Start, [Up], [Down], [Left], [Right]

Game Boy Color
CPU:     8-bit
Display: 160x144 pixels

Game Boy Advance (2001)
CPU:     32-bit
Display: 

Game Boy Advance SP (2003)
CPU:     32-bit
Display: 

*/

function device(name, description, hres, vres) {
	this.name = name;
	this.description = description;
	this.hres = hres;
	this.vres = vres;
	this.processInstruction = "function from corresponding data file";
}