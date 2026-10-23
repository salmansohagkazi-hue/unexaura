export interface DeliveryFeeDetails {
  baseCharge: number;         // Base delivery charge according to weight slab
  codFee: number;             // COD charge added to total (0 BDT as waived)
  calculatedCodFee: number;   // Calculated COD amount (0.5% inside Dhaka, 1.0% outside Dhaka)
  codPercentage: number;      // 0.5 or 1.0
  totalCharge: number;        // baseCharge + codFee
  slabDescription: string;    // Human readable slab explanation in Bengali
  extraKgCount: number;       // extra kg above 2kg
  billableWeightGrams: number;
  totalWeightGrams: number;
}

/**
 * Legacy check retained for backwards-compatibility without applying free shipping
 */
export function isAyatulKursiProduct(productOrItem: any): boolean {
  if (!productOrItem) return false;
  const prod = productOrItem.product || productOrItem;
  const id = prod.id ?? prod.product_id ?? productOrItem.id ?? productOrItem.product_id;
  if (id === 10) return true;

  const name = String(prod.name || prod.product_name || prod.slug || '').toLowerCase();
  return (
    name.includes('আয়াতুল কুরসি') ||
    name.includes('আয়াতুল কুরসি') ||
    name.includes('ayatul kursi') ||
    name.includes('ayatul-kursi')
  );
}

/**
 * Courier Delivery Charge Calculation:
 * - Products below 1 kg (<= 1000g):
 *     Inside Dhaka: 80 BDT
 *     Outside Dhaka: 130 BDT
 * - Products 1 kg – 2 kg (1001g – 2000g):
 *     Inside Dhaka: 100 BDT
 *     Outside Dhaka: 170 BDT
 * - Products above 2 kg (> 2000g):
 *     Inside Dhaka: 100 BDT + 20 BDT per additional kg
 *     Outside Dhaka: 170 BDT + 20 BDT per additional kg
 * 
 * COD Fee is waived (0 BDT).
 */
export function calculateDeliveryFee(
  weightGrams: number,
  deliveryZone: 'none' | 'dhaka' | 'outside_dhaka',
  subtotal: number = 0,
  _freeShippingThresholdDhaka: number = 0,
  _context?: any
): DeliveryFeeDetails {
  if (deliveryZone === 'none') {
    return {
      baseCharge: 0,
      codFee: 0,
      calculatedCodFee: 0,
      codPercentage: 0,
      totalCharge: 0,
      slabDescription: 'ডেলিভারি এলাকা নির্বাচন করুন',
      extraKgCount: 0,
      billableWeightGrams: weightGrams,
      totalWeightGrams: weightGrams
    };
  }

  const isDhaka = deliveryZone === 'dhaka';
  const codPercentage = isDhaka ? 0.5 : 1.0;
  const calculatedCodFee = Math.round((subtotal * codPercentage) / 100);
  const codFee = 0; // COD waived for customers

  const weight = Math.max(0, weightGrams);
  let baseCharge = 0;
  let extraKgCount = 0;
  let slabDescription = '';

  if (isDhaka) {
    if (weight <= 1000) {
      baseCharge = 80;
      slabDescription = '১ কেজির নিচে: ৮০৳ (ঢাকার ভেতরে)';
    } else if (weight <= 2000) {
      baseCharge = 100;
      slabDescription = '১ কেজি–২ কেজি: ১০০৳ (ঢাকার ভেতরে)';
    } else {
      extraKgCount = Math.ceil((weight - 2000) / 1000);
      baseCharge = 100 + (extraKgCount * 20);
      slabDescription = `>২ কেজি: ১০০৳ + অতিরিক্ত ${extraKgCount} কেজিতে ${extraKgCount * 20}৳ (${baseCharge}৳)`;
    }
  } else {
    // Outside Dhaka
    if (weight <= 1000) {
      baseCharge = 130;
      slabDescription = '১ কেজির নিচে: ১৩০৳ (ঢাকার বাইরে)';
    } else if (weight <= 2000) {
      baseCharge = 170;
      slabDescription = '১ কেজি–২ কেজি: ১৭০৳ (ঢাকার বাইরে)';
    } else {
      extraKgCount = Math.ceil((weight - 2000) / 1000);
      baseCharge = 170 + (extraKgCount * 20);
      slabDescription = `>২ কেজি: ১৭০৳ + অতিরিক্ত ${extraKgCount} কেজিতে ${extraKgCount * 20}৳ (${baseCharge}৳)`;
    }
  }

  return {
    baseCharge,
    codFee,
    calculatedCodFee,
    codPercentage,
    totalCharge: baseCharge + codFee,
    slabDescription,
    extraKgCount,
    billableWeightGrams: weight,
    totalWeightGrams: weight
  };
}
