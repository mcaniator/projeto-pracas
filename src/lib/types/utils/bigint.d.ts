declare global {
  interface BigInt {
    toJSON(): number | string;
  }
}

export {};
