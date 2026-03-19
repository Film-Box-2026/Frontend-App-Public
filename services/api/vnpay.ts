export interface VNPayConfig {
  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Locale: string;
  vnp_CurrCode: string;
  vnp_TxnRef: string;
  vnp_OrderInfo: string;
  vnp_Amount: number;
  vnp_ReturnUrl: string;
  vnp_IpAddr: string;
}

export interface VNPayResponse {
  code: string;
  message: string;
  data?: {
    transactionId: string;
    amount: number;
    status: 'pending' | 'success' | 'failed';
    plan: string;
  };
}

const VNP_VERSION = '2.1.0';
const VNP_COMMAND = 'pay';
const VNP_TMN_CODE = 'TMNCODE123'; // Mock TMN Code
const VNP_HASH_SECRET = 'SECRET_KEY'; // Mock Secret

const generateTxnRef = () => {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateIpAddr = () => {
  return '127.0.0.1'; // Mock IP
};

export const vnpayService = {
  generatePaymentUrl: (amount: number, plan: string, orderId: string): string => {
    const txnRef = generateTxnRef();
    const ipAddr = generateIpAddr();

    const params: Record<string, string | number> = {
      vnp_Version: VNP_VERSION,
      vnp_Command: VNP_COMMAND,
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Payment for ${plan} plan - Order ${orderId}`,
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: 'filebox://payment-callback',
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14),
    };

    // Tạo query string từ params (sorted)
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    // Mock URL (thực tế sẽ là VNpay gateway)
    return `https://sandbox.vnpayment.vn/paygate?${sortedParams}`;
  },

  verifyPayment: async (
    txnRef: string,
    responseCode: string
  ): Promise<VNPayResponse> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock success/failure based on response code
    if (responseCode === '00') {
      return {
        code: '00',
        message: 'Payment successful',
        data: {
          transactionId: txnRef,
          amount: 0,
          status: 'success',
          plan: 'premium',
        },
      };
    }

    return {
      code: '99',
      message: 'Payment failed or cancelled',
      data: {
        transactionId: txnRef,
        amount: 0,
        status: 'failed',
        plan: 'premium',
      },
    };
  },

  mockPaymentFlow: async (amount: number, plan: string) => {
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Random success/failure for demo
    const isSuccess = Math.random() > 0.2; // 80% success rate

    return {
      code: isSuccess ? '00' : '99',
      message: isSuccess ? 'Payment successful' : 'Payment failed',
      transactionId: generateTxnRef(),
      status: isSuccess ? 'success' : 'failed',
      amount,
      plan,
    };
  },
};
