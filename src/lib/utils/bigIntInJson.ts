//Important: This file modifies the global BigInt prototype to handle JSON serialization.
//This is necessary because JSON.stringify does not support BigInt by default.
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return Number.isNaN(int) ? this.toString() : int;
};
