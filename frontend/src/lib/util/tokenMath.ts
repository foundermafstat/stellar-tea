export const formatTokenAmount = (value?: bigint, decimals = 7): string => {
  if (value === undefined) {
    return "-";
  }

  const scale = BigInt(10) ** BigInt(decimals);
  const whole = value / scale;
  const fraction = value % scale;

  if (fraction === BigInt(0)) {
    return whole.toString();
  }

  const fractionString = fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");

  return `${whole.toString()}.${fractionString}`;
};

export const parseAmountToI128 = (raw: string, decimals: number): bigint => {
  const input = raw.trim();
  if (!input) {
    throw new Error("Enter an amount.");
  }

  if (!/^\d+(\.\d+)?$/.test(input)) {
    throw new Error("Invalid amount format.");
  }

  const [wholePart, fractionalPart = ""] = input.split(".");

  if (fractionalPart.length > decimals) {
    throw new Error(`Use at most ${decimals} decimal places.`);
  }

  const scale = BigInt(10) ** BigInt(decimals);
  const whole = BigInt(wholePart) * scale;
  const fraction = fractionalPart.padEnd(decimals, "0").slice(0, decimals);

  const fractionalValue = fraction ? BigInt(fraction) : BigInt(0);
  return whole + fractionalValue;
};
