/**
 * Google Sheets API Helper Services
 */

export interface GoogleSpreadsheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

const SHEET_HEADERS = [
  'Date & Time',
  'Order #',
  'Customer Name',
  'Mobile Number',
  'Email Address',
  'Shipping Address',
  'City',
  'Delivery Zone',
  'Items Summary',
  'Total Weight (g)',
  'Delivery Fee (BDT)',
  'Subtotal (BDT)',
  'Total Amount (BDT)',
  'Payment Method',
  'Payment Details',
  'Payment Status',
  'Order Status',
  'Tracking Number',
  'Courier Partner'
];

/**
 * Creates a brand new Google Sheet in the user's Google Drive for tracking UNEX AURA Customer Orders.
 */
export async function createOrdersSpreadsheet(accessToken: string): Promise<GoogleSpreadsheetInfo> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: `UNEX AURA - Customer Orders & Sales Log (${new Date().getFullYear()})`
      },
      sheets: [
        {
          properties: {
            title: 'Customer Orders',
            gridProperties: {
              frozenRowCount: 1
            }
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: SHEET_HEADERS.map(header => ({
                    userEnteredValue: { stringValue: header },
                    userEnteredFormat: {
                      textFormat: { bold: true, foregroundColorStyle: { rgbColor: { red: 1, green: 1, blue: 1 } } },
                      backgroundColorStyle: { rgbColor: { red: 0.08, green: 0.12, blue: 0.22 } },
                      horizontalAlignment: 'CENTER'
                    }
                  }))
                }
              ]
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets creation failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: data.properties?.title || 'UNEX AURA Orders Sheet'
  };
}

/**
 * Formats order object into a spreadsheet row array
 */
export function formatOrderToRow(order: any): string[] {
  const itemsText = Array.isArray(order.items)
    ? order.items.map((it: any) => `${it.product_name || it.name} (x${it.quantity || 1})`).join('; ')
    : 'No items';

  const paymentDetails = order.bkash_number || order.bkash_trxid
    ? `Bkash: ${order.bkash_number || 'N/A'}, TrxID: ${order.bkash_trxid || 'N/A'}`
    : order.payment_method?.toUpperCase() || 'COD';

  return [
    order.created_at || new Date().toLocaleString(),
    order.order_number || 'N/A',
    order.user_name || 'N/A',
    order.user_phone || 'N/A',
    order.user_email || 'N/A',
    order.shipping_address || 'N/A',
    order.city || 'Dhaka',
    order.delivery_zone === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka',
    itemsText,
    String(order.total_weight_grams || 0),
    String(order.delivery_charge || 0),
    String(order.subtotal_amount || 0),
    String(order.total_amount || 0),
    (order.payment_method || 'cod').toUpperCase(),
    paymentDetails,
    (order.payment_status || 'unpaid').toUpperCase(),
    (order.status || 'pending').toUpperCase(),
    order.tracking_number || 'N/A',
    order.courier_name || 'N/A'
  ];
}

/**
 * Appends multiple order rows into an existing Google Sheet.
 */
export async function appendOrdersToSheet(
  accessToken: string,
  spreadsheetId: string,
  orders: any[]
): Promise<{ updatedRows: number }> {
  if (!orders || orders.length === 0) return { updatedRows: 0 };

  const rows = orders.map(formatOrderToRow);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Customer Orders'!A1:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: rows
    })
  });

  if (!response.ok) {
    // If 'Customer Orders' tab is not found, fallback to appending to range A1
    const fallbackUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`;
    const fallbackRes = await fetch(fallbackUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: rows })
    });

    if (!fallbackRes.ok) {
      const errText = await fallbackRes.text();
      throw new Error(`Failed to append order to Google Sheet: ${errText}`);
    }

    const fallbackData = await fallbackRes.json();
    return { updatedRows: fallbackData.updates?.updatedRows || rows.length };
  }

  const data = await response.json();
  return { updatedRows: data.updates?.updatedRows || rows.length };
}

/**
 * Initializes header row in case existing sheet doesn't have headers.
 */
export async function ensureSheetHeader(accessToken: string, spreadsheetId: string): Promise<void> {
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Z1`;
  const res = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (res.ok) {
    const data = await res.json();
    if (!data.values || data.values.length === 0) {
      // Put header row
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: [SHEET_HEADERS] })
      });
    }
  }
}
