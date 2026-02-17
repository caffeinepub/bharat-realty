export interface OfferOption {
  amount: bigint;
  label: string;
  optionIndex: number;
}

export function generateOfferOptions(quotedPrice: bigint): OfferOption[] {
  const price = Number(quotedPrice);
  
  const option1 = Math.round(price * 0.65);
  const option2 = Math.round(option1 * 0.65);
  const option3 = Math.round(option2 * 0.65);

  return [
    {
      amount: BigInt(option1),
      label: '35% off listed price',
      optionIndex: 1,
    },
    {
      amount: BigInt(option2),
      label: '35% off option 1',
      optionIndex: 2,
    },
    {
      amount: BigInt(option3),
      label: '35% off option 2',
      optionIndex: 3,
    },
  ];
}

export function formatINR(amount: bigint | number): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}
