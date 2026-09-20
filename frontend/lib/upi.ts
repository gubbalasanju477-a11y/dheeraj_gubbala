/**
 * Builds a UPI payment deep link following the standard "upi://pay?..."
 * intent format that GPay/PhonePe/Paytm/BHIM and most UPI apps recognize.
 * Tapping/scanning it opens the user's UPI app pre-filled with these
 * details — there's no gateway/server involved on our side at this step.
 */
export function buildUpiPaymentLink(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
}) {
  const { upiId, payeeName, amount, transactionNote } = params;

  const query = new URLSearchParams({
    pa: upiId, // payee address (the UPI ID)
    pn: payeeName, // payee name
    am: amount.toFixed(2), // amount
    cu: "INR",
    tn: transactionNote, // transaction note, e.g. an order reference
  });

  return `upi://pay?${query.toString()}`;
}
