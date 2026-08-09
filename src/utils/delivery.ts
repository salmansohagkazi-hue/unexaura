export interface DeliveryFeeDetails {
  baseCharge: number;         // Base delivery charge according to weight slab (or 0 if free shipping applies)
  codFee: number;             // COD charge added to total (0 BDT as it is free)
  calculatedCodFee: number;   // Calculated COD amount (0.5% inside Dhaka, 1.0% outside Dhaka)
  codPercentage: number;      // 0.5 or 1.0
  totalCharge: number;        // baseCharge + codFee
  slabDescription: string;    // Human readable slab explanation in Bengali
  extraKgCount: number;       // extra kg above 2kg
}

/**
 * Calculates delivery charge and Cash on Delivery (COD) fee according to courier rate card:
 * Inside Dhaka:
 *   - 0 – 500g: 60 BDT
 *   - 500g – 1 kg: 70 BDT
 *   - 1 kg – 2 kg: 90 BDT
 *   - > 2 kg: 90 + 20 BDT per extra kg
 *   - COD Fee: 0.5% of order subtotal
 *
 * Outside Dhaka:
 *   - 0 – 500g: 110 BDT
 *   - 500g – 1 kg: 130 BDT
 *   - 1 kg – 2 kg: 170 BDT
 *   - > 2 kg: 170 + 20 BDT per extra kg
 *   - COD Fee: 1.0% of order subtotal
 */
export function calculateDeliveryFee(
  weightGrams: number,
  deliveryZone: 'none' | 'dhaka' | 'outside_dhaka',
  subtotal: number = 0,
  freeShippingThresholdDhaka: number = 3000
): DeliveryFeeDetails {
  if (deliveryZone === 'none') {
    return {
      baseCharge: 0,
      codFee: 0,
      calculatedCodFee: 0,
      codPercentage: 0,
      totalCharge: 0,
      slabDescription: 'ডেলিভারি জোন সিলেক্ট করুন (Select Delivery Zone)',
      extraKgCount: 0
    };
  }

  const isDhaka = deliveryZone === 'dhaka';
  let baseCharge = 0;
  let slabDescription = '';
  let extraKgCount = 0;

  // Check free shipping threshold for Dhaka
  if (isDhaka && freeShippingThresholdDhaka > 0 && subtotal >= freeShippingThresholdDhaka) {
    baseCharge = 0;
    slabDescription = 'ফ্রি ডেলিভারি অফার (৩,০০০+ টাকার অর্ডারে)';
  } else if (isDhaka) {
    if (weightGrams <= 500) {
      baseCharge = 60;
      slabDescription = '০ - ৫০০ গ্রাম (৬০ টাকা)';
    } else if (weightGrams <= 1000) {
      baseCharge = 70;
      slabDescription = '৫০০ গ্রাম - ১ কেজি (৭০ টাকা)';
    } else if (weightGrams <= 2000) {
      baseCharge = 90;
      slabDescription = '১ কেজি - ২ কেজি (৯০ টাকা)';
    } else {
      extraKgCount = Math.ceil((weightGrams - 2000) / 1000);
      baseCharge = 90 + extraKgCount * 20;
      slabDescription = `২ কেজি পার (৯০ + প্রতি কেজি ২০ টাকা x ${extraKgCount} = ${baseCharge} টাকা)`;
    }
  } else {
    // Outside Dhaka
    if (weightGrams <= 500) {
      baseCharge = 110;
      slabDescription = '০ - ৫০০ গ্রাম (১১০ টাকা)';
    } else if (weightGrams <= 1000) {
      baseCharge = 130;
      slabDescription = '৫০ গ্রাম - ১ কেজি (১৩০ টাকা)';
    } else if (weightGrams <= 2000) {
      baseCharge = 170;
      slabDescription = '১ কেজি - ২ কেজি (১৭০ টাকা)';
    } else {
      extraKgCount = Math.ceil((weightGrams - 2000) / 1000);
      baseCharge = 170 + extraKgCount * 20;
      slabDescription = `২ কেজি পার (১৭০ + প্রতি কেজি ২০ টাকা x ${extraKgCount} = ${baseCharge} টাকা)`;
    }
  }

  // COD Charge rate: 0.5% inside Dhaka, 1.0% outside Dhaka
  const codPercentage = isDhaka ? 0.5 : 1.0;
  const calculatedCodFee = Math.round((subtotal * codPercentage) / 100);
  const codFee = 0; // Completely free / waived for customer

  return {
    baseCharge,
    codFee,
    calculatedCodFee,
    codPercentage,
    totalCharge: baseCharge,
    slabDescription,
    extraKgCount
  };
}
