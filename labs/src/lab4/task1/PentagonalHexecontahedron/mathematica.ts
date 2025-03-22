const phi: number = (1 + Math.sqrt(5)) / 2;
const a: number = Math.sqrt(phi - 5/27);
const b: number = Math.pow((phi + a)/2, 1/3);
const c: number = Math.pow((phi - a)/2, 1/3);
const x: number = b + c;

const C0: number = phi * Math.sqrt(3 - Math.pow(x, 2)) / 2;
const C1: number = phi * Math.sqrt((x - 1 - (1/x)) * phi) / (2 * x);
const C2: number = phi * Math.sqrt((x - 1 - (1/x)) * phi) / 2;
const C3: number = Math.pow(x, 2) * phi * Math.sqrt(3 - Math.pow(x, 2)) / 2;
const C4: number = phi * Math.sqrt(1 - x + (phi + 1)/x) / 2;
const C5: number = Math.sqrt(x * (x + phi) + 1) / (2 * x);
const C6: number = Math.sqrt((x + 2) * phi + 2) / (2 * x);
const C7: number = Math.sqrt(-Math.pow(x, 2)*(phi + 2) + x*(3*phi + 1) + 4) / 2;
const C8: number = (phi + 1) * Math.sqrt(1 + (1/x)) / (2 * x);
const C9: number = Math.sqrt(3*phi + 2 - 2*x + (3/x)) / 2;
const C10: number = Math.sqrt(
  Math.pow(x, 2)*(225*phi + 392) + 
  x*(670*phi + 249) + 
  (157*phi + 470)
) / 62;
const C11: number = phi * Math.sqrt(x*(x + phi) + 1) / (2 * x);
const C12: number = phi * Math.sqrt(Math.pow(x, 2) + x + phi + 1) / (2 * x);
const C13: number = phi * Math.sqrt(Math.pow(x, 2) + 2*x*phi + 2) / (2 * x);
const C14: number = Math.sqrt(Math.pow(x, 2)*(2*phi + 1) - phi) / 2;
const C15: number = phi * Math.sqrt(Math.pow(x, 2) + x) / 2;
const C16: number = Math.pow(phi, 3) * Math.sqrt(x*(x + phi) + 1) / (2 * Math.pow(x, 2));
const C17: number = Math.sqrt(
  Math.pow(x, 2)*(842*phi + 617) + 
  x*(1589*phi + 919) + 
  (784*phi + 627)
) / 62;
const C18: number = Math.pow(phi, 2) * Math.sqrt(x*(x + phi) + 1) / (2 * x);
const C19: number = phi * Math.sqrt(x*(x + phi) + 1) / 2;

const Pentagonal_Hexec_faces  = [
    24,  0,  2, 14, 36,
    24, 36, 72, 86, 76,
    24, 76, 40, 16, 52,
    24, 52, 64, 84, 60,
    24, 60, 48, 12,  0,
    25,  1,  3, 13, 37,
    25, 37, 73, 85, 77,
    25, 77, 41, 17, 53,
    25, 53, 65, 87, 61,
    25, 61, 49, 15,  1,
    26,  2,  0, 12, 38,
    26, 38, 74, 88, 78,
    26, 78, 42, 18, 54,
    26, 54, 66, 90, 62,
    26, 62, 50, 14,  2,
    27,  3,  1, 15, 39,
    27, 39, 75, 91, 79,
    27, 79, 43, 19, 55,
    27, 55, 67, 89, 63,
    27, 63, 51, 13,  3,
    28,  4,  5, 17, 41,
    28, 41, 77, 85, 81,
    28, 81, 45, 20, 56,
    28, 56, 68, 84, 64,
    28, 64, 52, 16,  4,
    29,  5,  4, 16, 40,
    29, 40, 76, 86, 80,
    29, 80, 44, 21, 57,
    29, 57, 69, 87, 65,
    29, 65, 53, 17,  5,
    30,  7,  6, 18, 42,
    30, 42, 78, 88, 82,
    30, 82, 46, 22, 59,
    30, 59, 71, 89, 67,
    30, 67, 55, 19,  7,
    31,  6,  7, 19, 43,
    31, 43, 79, 91, 83,
    31, 83, 47, 23, 58,
    31, 58, 70, 90, 66,
    31, 66, 54, 18,  6,
    32,  8, 11, 22, 46,
    32, 46, 82, 88, 74,
    32, 74, 38, 12, 48,
    32, 48, 60, 84, 68,
    32, 68, 56, 20,  8,
    33, 11,  8, 20, 45,
    33, 45, 81, 85, 73,
    33, 73, 37, 13, 51,
    33, 51, 63, 89, 71,
    33, 71, 59, 22, 11,
    34, 10,  9, 21, 44,
    34, 44, 80, 86, 72,
    34, 72, 36, 14, 50,
    34, 50, 62, 90, 70,
    34, 70, 58, 23, 10,
    35,  9, 10, 23, 47,
    35, 47, 83, 91, 75,
    35, 75, 39, 15, 49,
    35, 49, 61, 87, 69,
    35, 69, 57, 21,  9 
];

const Pentagonal_Hexec_cords  = [
      C0,   C1,  C19,
      C0,  -C1, -C19,
     -C0,  -C1,  C19,
     -C0,   C1, -C19,
     C19,   C0,   C1,
     C19,  -C0,  -C1,
    -C19,  -C0,   C1,
    -C19,   C0,  -C1,
      C1,  C19,   C0,
      C1, -C19,  -C0,
     -C1, -C19,   C0,
     -C1,  C19,  -C0,
     0.0,   C5,  C18,
     0.0,   C5, -C18,
     0.0,  -C5,  C18,
     0.0,  -C5, -C18,
     C18,  0.0,   C5,
     C18,  0.0,  -C5,
    -C18,  0.0,   C5,
    -C18,  0.0,  -C5,
      C5,  C18,  0.0,
      C5, -C18,  0.0,
     -C5,  C18,  0.0,
     -C5, -C18,  0.0,
     C10,  0.0,  C17,
     C10,  0.0, -C17,
    -C10,  0.0,  C17,
    -C10,  0.0, -C17,
     C17,  C10,  0.0,
     C17, -C10,  0.0,
    -C17,  C10,  0.0,
    -C17, -C10,  0.0,
     0.0,  C17,  C10,
     0.0,  C17, -C10,
     0.0, -C17,  C10,
     0.0, -C17, -C10,
      C3,  -C6,  C16,
      C3,   C6, -C16,
     -C3,   C6,  C16,
     -C3,  -C6, -C16,
     C16,  -C3,   C6,
     C16,   C3,  -C6,
    -C16,   C3,   C6,
    -C16,  -C3,  -C6,
      C6, -C16,   C3,
      C6,  C16,  -C3,
     -C6,  C16,   C3,
     -C6, -C16,  -C3,
      C2,   C9,  C15,
      C2,  -C9, -C15,
     -C2,  -C9,  C15,
     -C2,   C9, -C15,
     C15,   C2,   C9,
     C15,  -C2,  -C9,
    -C15,  -C2,   C9,
    -C15,   C2,  -C9,
      C9,  C15,   C2,
      C9, -C15,  -C2,
     -C9, -C15,   C2,
     -C9,  C15,  -C2,
      C7,   C8,  C14,
      C7,  -C8, -C14,
     -C7,  -C8,  C14,
     -C7,   C8, -C14,
     C14,   C7,   C8,
     C14,  -C7,  -C8,
    -C14,  -C7,   C8,
    -C14,   C7,  -C8,
      C8,  C14,   C7,
      C8, -C14,  -C7,
     -C8, -C14,   C7,
     -C8,  C14,  -C7,
      C4, -C12,  C13,
      C4,  C12, -C13,
     -C4,  C12,  C13,
     -C4, -C12, -C13,
     C13,  -C4,  C12,
     C13,   C4, -C12,
    -C13,   C4,  C12,
    -C13,  -C4, -C12,
     C12, -C13,   C4,
     C12,  C13,  -C4,
    -C12,  C13,   C4,
    -C12, -C13,  -C4,
     C11,  C11,  C11,
     C11,  C11, -C11,
     C11, -C11,  C11,
     C11, -C11, -C11,
    -C11,  C11,  C11,
    -C11,  C11, -C11,
    -C11, -C11,  C11,
    -C11, -C11, -C11
];

export {
    Pentagonal_Hexec_cords,
    Pentagonal_Hexec_faces,
}