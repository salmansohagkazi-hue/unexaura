import { Order, OrderItem } from '../types';

/**
 * Clean and format a Bangladeshi phone number into standard international format for WhatsApp (e.g. 8801XXXXXXXXX)
 */
export const cleanWhatsAppNumber = (phoneStr: string = '01623319639'): string => {
  let cleaned = (phoneStr || '').trim().replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '880' + cleaned.substring(1);
  } else if (!cleaned.startsWith('880')) {
    cleaned = '880' + cleaned;
  }
  return cleaned;
};

/**
 * Generates an elegantly formatted WhatsApp message containing complete order details
 */
export const formatOrderWhatsAppMessage = (order: Order, storeName: string = 'UNEX AURA'): string => {
  const isDhaka = order.delivery_zone === 'dhaka' || (order.city || '').toLowerCase().includes('dhaka');
  const zoneText = isDhaka ? 'ঢাকার ভেতরে (Inside Dhaka)' : 'ঢাকার বাইরে (Outside Dhaka)';

  let paymentText = 'ক্যাশ অন ডেলিভারি (Cash on Delivery)';
  if (order.payment_method === 'bkash') {
    paymentText = 'বিকাশ (bKash)';
  } else if (order.payment_method === 'nagad') {
    paymentText = 'নগদ (Nagad)';
  } else if (order.payment_method === 'stripe') {
    paymentText = 'অনলাইন পেমেন্ট / কার্ড (Card/Stripe)';
  }

  const itemsList = (order.items || []).map((item: OrderItem, idx: number) => {
    const sizeInfo = item.selected_size_name ? ` (সাইজ: ${item.selected_size_name})` : '';
    const itemTotal = ((item.price || 0) * (item.quantity || 1)).toLocaleString('en-BD');
    return `${idx + 1}. *${item.product_name}*${sizeInfo}\n   ▫️ পরিমাণ: ${item.quantity} টি | মোট: ৳${itemTotal}`;
  }).join('\n');

  const formattedDate = order.created_at || new Date().toLocaleString('en-GB');

  const msg = `🛍️ *নতুন অর্ডার রিসিভ হয়েছে - ${storeName}*
━━━━━━━━━━━━━━━━━━━━━━━━
📋 *অর্ডার নম্বর:* #${order.order_number}
📅 *তারিখ ও সময়:* ${formattedDate}

👤 *গ্রাহকের তথ্য (Customer Details):*
▫️ *নাম:* ${order.user_name || 'Customer'}
▫️ *মোবাইল নম্বর:* ${order.user_phone || 'N/A'}
▫️ *ঠিকানা:* ${order.shipping_address || ''}
▫️ *জেলা/শহর:* ${order.city || 'ঢাকা'}
▫️ *ডেলিভারি জোন:* ${zoneText}

📦 *অর্ডারকৃত পণ্যসমূহ (Ordered Items):*
${itemsList || '১. প্রোডাক্ট'}

💰 *বিল ও মূল্য বিবরণ (Financial Summary):*
▫️ প্রোডাক্ট সাব-টোটাল: ৳${(order.subtotal_amount || 0).toLocaleString('en-BD')}
▫️ ডেলিভারি চার্জ: ${order.delivery_charge === 0 ? 'ফ্রি ডেলিভারি (FREE)' : '৳' + (order.delivery_charge || 0).toLocaleString('en-BD')}
${order.discount_amount ? `▫️ কুপন ডিসকাউন্ট: -৳${(order.discount_amount || 0).toLocaleString('en-BD')}\n` : ''}▫️ *সর্বমোট প্রদেয় বিল (Total Bill): ৳${(order.total_amount || 0).toLocaleString('en-BD')}*
▫️ পেমেন্ট মেথড: ${paymentText}
${order.order_notes ? `\n📝 *গ্রাহকের বিশেষ নোট (Order Note):*\n"${order.order_notes}"\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *অর্ডারটি দ্রুত ভেরিফাই করে প্রসেসিং সম্পন্ন করুন।*`;

  return msg;
};

/**
 * Builds the direct WhatsApp API web link to open WhatsApp on mobile app or web
 */
export const getWhatsAppOrderUrl = (order: Order, adminPhoneNumber: string = '01623319639'): string => {
  const targetPhone = cleanWhatsAppNumber(adminPhoneNumber);
  const messageText = formatOrderWhatsAppMessage(order);
  return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(messageText)}`;
};

/**
 * Dispatches the WhatsApp URL automatically by opening in a safe new window / tab
 */
export const dispatchOrderToWhatsApp = (order: Order, adminPhoneNumber: string = '01623319639'): string => {
  const waUrl = getWhatsAppOrderUrl(order, adminPhoneNumber);
  try {
    const newTab = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
      // If popup was blocked, fallback can be handled on the next page
      console.log('WhatsApp popup auto-dispatch opened or queued.');
    }
  } catch (e) {
    console.warn('Auto open WhatsApp window prevented:', e);
  }
  return waUrl;
};
