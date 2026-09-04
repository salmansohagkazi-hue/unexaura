export interface DeliveryFeeDetails {
  baseCharge: number;         // Base delivery charge according to weight slab (or 0 if free shipping applies)
  codFee: number;             // COD charge added to total (0 BDT as it is waived for customer)
  calculatedCodFee: number;   // Calculated COD amount (0.5% inside Dhaka, 1.0% outside Dhaka)
  codPercentage: number;      // 0.5 or 1.0
  totalCharge: number;        // baseCharge + codFee
  slabDescription: string;    // Human readable slab explanation in Bengali
  extraKgCount: number;       // extra kg above 2kg
  isAyatulKursiFreeOffer?: boolean; // Whether Ayatul Kursi free delivery applied
  hasOtherProducts?: boolean;       // Whether non-free items are in the order
  billableWeightGrams?: number;     // Weight used for fee calculation (excluding Ayatul Kursi)
  totalWeightGrams?: number;        // Total physical weight of cart
  ayatulKursiWeightGrams?: number;  // Waived weight from Ayatul Kursi
}

/**
 * Checks if a given product or cart item is Ayatul Kursi
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
 * Calculates delivery charge and Cash on Delivery (COD) fee according to courier rate card:
 * 
 * Rules:
 * 1. Only "Ayatul Kursi" gets 100% Free Home Delivery (0 BDT).
 * 2. If only other products are ordered, delivery charge is based on their total weight.
 * 3. If Ayatul Kursi is ordered WITH other products, Ayatul Kursi's delivery is FREE,
 *    and delivery charge is calculated ONLY for the remaining products according to their weight.
 *
 * Courier Rate Card:
 * Inside Dhaka:
 *   - 0 – 500g: 60 BDT
 *   - 500g – 1 kg: 70 BDT
 *   - 1 kg – 2 kg: 90 BDT
 *   - > 2 kg: 90 + 20 BDT per extra kg
 *
 * Outside Dhaka:
 *   - 0 – 500g: 110 BDT
 *   - 500g – 1 kg: 130 BDT
 *   - 1 kg – 2 kg: 170 BDT
 *   - > 2 kg: 170 + 20 BDT per extra kg
 */
export function calculateDeliveryFee(
  weightGrams: number,
  deliveryZone: 'none' | 'dhaka' | 'outside_dhaka',
  subtotal: number = 0,
  freeShippingThresholdDhaka: number = 0,
  context?: {
    isAyatulKursiOnly?: boolean;
    hasAyatulKursi?: boolean;
    hasOtherProducts?: boolean;
    ayatulKursiWeight?: number;
    totalWeight?: number;
  }
): DeliveryFeeDetails {
  if (deliveryZone === 'none') {
    return {
      baseCharge: 0,
      codFee: 0,
      calculatedCodFee: 0,
      codPercentage: 0,
      totalCharge: 0,
      slabDescription: 'ডেলিভারি জোন সিলেক্ট করুন (Select Delivery Zone)',
      extraKgCount: 0,
      isAyatulKursiFreeOffer: context?.hasAyatulKursi,
      hasOtherProducts: context?.hasOtherProducts,
      billableWeightGrams: weightGrams,
      totalWeightGrams: context?.totalWeight ?? weightGrams,
      ayatulKursiWeightGrams: context?.ayatulKursiWeight ?? 0
    };
  }

  const isDhaka = deliveryZone === 'dhaka';
  const codPercentage = isDhaka ? 0.5 : 1.0;
  const calculatedCodFee = Math.round((subtotal * codPercentage) / 100);
  const codFee = 0; // COD is free / waived for customer

  const isAyatulKursiOnly = context?.isAyatulKursiOnly ?? (context?.hasAyatulKursi && !context?.hasOtherProducts);
  const hasAyatulKursi = Boolean(context?.hasAyatulKursi);
  const hasOtherProducts = Boolean(context?.hasOtherProducts);

  // CASE 1: Only Ayatul Kursi in order -> 100% Free Delivery!
  if (isAyatulKursiOnly) {
    const slabDescription = isDhaka
      ? 'আয়াতুল কুরসি অফার: ঢাকায় ফ্রি হোম ডেলিভারি (৳০)'
      : 'আয়াতুল কুরসি অফার: সারা দেশে ফ্রি হোম ডেলিভারি (৳০)';

    return {
      baseCharge: 0,
      codFee: 0,
      calculatedCodFee,
      codPercentage,
      totalCharge: 0,
      slabDescription,
      extraKgCount: 0,
      isAyatulKursiFreeOffer: true,
      hasOtherProducts: false,
      billableWeightGrams: 0,
      totalWeightGrams: context?.totalWeight ?? weightGrams,
      ayatulKursiWeightGrams: context?.ayatulKursiWeight ?? weightGrams
    };
  }

  // Calculate rate card on billable weight (non-Ayatul Kursi weight if Ayatul Kursi is present)
  const billableWeight = Math.max(0, weightGrams);
  let baseCharge = 0;
  let extraKgCount = 0;
  let slabDescription = '';

  if (billableWeight === 0 && hasAyatulKursi) {
    // Only 0-weight or free items
    baseCharge = 0;
    slabDescription = 'আয়াতুল কুরসি ফ্রি ডেলিভারি (৳০)';
  } else if (isDhaka) {
    if (billableWeight <= 500) {
      baseCharge = 60;
      slabDescription = '০–৫০০ গ্রাম: ৬০৳';
    } else if (billableWeight <= 1000) {
      baseCharge = 70;
      slabDescription = '৫০০ গ্রাম–১ কেজি: ৭০৳';
    } else if (billableWeight <= 2000) {
      baseCharge = 90;
      slabDescription = '১ কেজি–২ কেজি: ৯০৳';
    } else {
      extraKgCount = Math.ceil((billableWeight - 2000) / 1000);
      baseCharge = 90 + (extraKgCount * 20);
      slabDescription = `>২ কেজি: ৯০৳ + অতিরিক্ত ${extraKgCount} কেজিতে ${extraKgCount * 20}৳ (${baseCharge}৳)`;
    }
  } else {
    // Outside Dhaka
    if (billableWeight <= 500) {
      baseCharge = 110;
      slabDescription = '০–৫০০ গ্রাম: ১১০৳';
    } else if (billableWeight <= 1000) {
      baseCharge = 130;
      slabDescription = '৫০০ গ্রাম–১ কেজি: ১৩০৳';
    } else if (billableWeight <= 2000) {
      baseCharge = 170;
      slabDescription = '১ কেজি–২ কেজি: ১৭০৳';
    } else {
      extraKgCount = Math.ceil((billableWeight - 2000) / 1000);
      baseCharge = 170 + (extraKgCount * 20);
      slabDescription = `>২ কেজি: ১৭০৳ + অতিরিক্ত ${extraKgCount} কেজিতে ${extraKgCount * 20}৳ (${baseCharge}৳)`;
    }
  }

  // CASE 2: Ayatul Kursi + Other products combo
  if (hasAyatulKursi && hasOtherProducts) {
    const billableStr = billableWeight >= 1000
      ? `${(billableWeight / 1000).toFixed(1)} কেজি`
      : `${billableWeight} গ্রাম`;
    slabDescription = `আয়াতুল কুরসি ফ্রি ডেলিভারি + বাকি পণ্যের (${billableStr}) ওজন স্ল্যাব: ${baseCharge}৳`;
  }

  return {
    baseCharge,
    codFee,
    calculatedCodFee,
    codPercentage,
    totalCharge: baseCharge + codFee,
    slabDescription,
    extraKgCount,
    isAyatulKursiFreeOffer: hasAyatulKursi,
    hasOtherProducts,
    billableWeightGrams: billableWeight,
    totalWeightGrams: context?.totalWeight ?? weightGrams,
    ayatulKursiWeightGrams: context?.ayatulKursiWeight ?? 0
  };
}

