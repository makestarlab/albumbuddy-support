export interface FaqItem {
  q: string;
  a: string;
  category: string;
}

export const faqs: FaqItem[] = [
  // ── Account ──────────────────────────────────────────────────
  {
    category: 'Account',
    q: 'I forgot my password. How can I reset it?',
    a: 'To recover your AlbumBuddy account password:\n1. Visit the AlbumBuddy website.\n2. Click "Log In" in the top-right corner.\n3. Enter your email and click the Forgot Password button.\n4. Check your email for a reset link and follow the instructions.\n\nContact support if you continue to have issues.',
  },
  {
    category: 'Account',
    q: 'How can I add a shipping address?',
    a: 'Go to My Page > My Address to enter and save your shipping address. Please note that AlbumBuddy is not responsible for delivery issues caused by incorrect address information provided by the user.',
  },
  {
    category: 'Account',
    q: 'I did not receive referral points. (Inviter / New Member)',
    a: 'Referral points will not be provided if you proceed with sign-up by moving away from the initial page accessed via the referral link.\n\nPoints are awarded when new members sign up via the referral link and complete their first order. Please ensure the entire sign-up flow is completed without navigating away.',
  },

  // ── Order ─────────────────────────────────────────────────────
  {
    category: 'Order',
    q: 'I want to cancel the order.',
    a: 'Order cancellations may not be possible depending on the purchase status.\n\n• Possible: Order not yet completed, or seller can cancel.\n• Not possible: Order already completed, or Bunjang products.\n\nPlease note that PayPal fees are non-refundable.',
  },
  {
    category: 'Order',
    q: 'What is the buy back point?',
    a: 'If you select the POB Only option, this is an event where AlbumBuddy purchases your album and provides you with points usable on AlbumBuddy.\n\nThis service is only available for customers who used the purchasing agency service. Points are provided after packaging is completed.',
  },
  {
    category: 'Order',
    q: 'The event is ending soon. Is it possible to place an order?',
    a: 'Orders must be completed at least 6 hours before the event sales deadline (KST).\n\nWe recommend completing your order one day before the deadline to ensure ample time. Contact support for modified deadlines or if you need to make entry changes — please include your AlbumBuddy order number.',
  },
  {
    category: 'Order',
    q: 'I cannot select the detailed options for entering the event. What should I do?',
    a: 'Depending on the type of event, additional information may be required (e.g. fan club membership details, pre-order location, etc.).\n\nPlease contact CS at least 6 hours prior to the event deadline, and include your AlbumBuddy order number for faster processing.',
  },
  {
    category: 'Order',
    q: 'The package has been put on hold.',
    a: 'If your package is on hold, you can click on the package to check the reason.\n\nCommon reasons include:\n• Product composition differs from what was stated\n• Confirmation needed on the packaging method\n• Shipping was requested before packaging was complete',
  },
  {
    category: 'Order',
    q: 'The product registration (Request item) is not working.',
    a: 'Due to various reasons, the product registration request may not be processed successfully.\n\nPlease provide the product sales link via CS consultation and our team will assist with manually adding the item.',
  },
  {
    category: 'Order',
    q: "What if the product I want isn't available on AlbumBuddy?",
    a: 'Use the "Request Item" feature to request product updates.\n\n• Registered sellers: updates within 5 minutes.\n• New sellers: updates within 24 hours.',
  },
  {
    category: 'Order',
    q: 'I would like to know if the K-address has been entered correctly. What are the City and State/Province/Region?',
    a: "Main address: 965, Deokpyeong-ro, Majang-myeon, Icheon-si, Gyeonggi-do\nDetail address: 3F, #your_warehouse_code\nCity: Icheon-si\nState/Province/Region: Gyeonggi-do\n\nFor Weverse orders, enter the recipient's name exactly as it appears as the orderer's name.",
  },

  // ── Shipping ──────────────────────────────────────────────────
  {
    category: 'Shipping',
    q: "I don't know what the shipping options are.",
    a: 'AlbumBuddy supports four packaging methods:\n\n1. Direct Shipment — shipped as delivered from the seller.\n2. Consolidation Only — combines multiple packages into one.\n3. Inclusion Only — removes outer packaging, ships only selected inclusions (photo cards, etc.).\n4. POB Only — ships only prize/benefit items.\n\nChoose the option that best fits your needs at checkout.',
  },
  {
    category: 'Shipping',
    q: 'What is the Inclusion Only service?',
    a: 'This service opens the albums and takes out the inclusions (either just the photo cards or all inclusions) to be packaged and shipped to you.\n\nThis includes all POBs and signed items.',
  },
  {
    category: 'Shipping',
    q: 'What are the benefits of consolidation and repackaging?',
    a: 'These services can reduce shipping costs:\n\n• Consolidation combines multiple packages into one, minimizing dimensional weight.\n• Repackaging reduces box size to lower shipping fees.\n\nProcessing takes 2–3 business days. Changes cannot be made after submission.',
  },
  {
    category: 'Shipping',
    q: 'I would like to know the countries where shipping is available.',
    a: 'You can check the countries available for shipping on the product purchase page.\n\nPlease note that shipping to Korean addresses is not supported. Review the list on the purchase page for eligible destinations.',
  },
  {
    category: 'Shipping',
    q: 'I would like to use a shipping forwarding service.',
    a: 'You can use the shipping forwarding service at any time as long as you accurately enter your My K-address and warehouse_code.\n\nNo prior notification is needed. Shipping to Korean addresses is not supported. Packages are typically registered within 1–3 business days.',
  },
  {
    category: 'Shipping',
    q: 'How long will AlbumBuddy store my package?',
    a: 'AlbumBuddy offers free storage for up to 90 days.\n\nAfter 90 days: $1 per package per day (up to 60 additional days).\nMaximum storage period: 150 days.\n\nPackages may be discarded after the maximum storage period. You will receive automated notifications as deadlines approach.',
  },
  {
    category: 'Shipping',
    q: 'Which shipping carriers are available?',
    a: 'AlbumBuddy offers carriers such as FedEx and UPS.\n\nAvailable options depend on package weight, dimensions, and destination country.',
  },
  {
    category: 'Shipping',
    q: 'Can I change the delivery address after shipment?',
    a: "Address changes may incur additional fees depending on the carrier's policy.\n\nContact AlbumBuddy support immediately to confirm whether changes are allowed and to determine any applicable fees.",
  },
  {
    category: 'Shipping',
    q: 'What if my package is delayed due to customs?',
    a: 'For customs delays, contact the carrier directly for the most accurate updates.\n\nAlbumBuddy will notify customers of customs clearance issue updates. You may also reach FedEx Customer Support directly for inquiries.',
  },
  {
    category: 'Shipping',
    q: 'What should I do if my package arrives damaged or with missing items?',
    a: '1. Retain all original packaging (do not discard).\n2. File a claim with the local delivery carrier and gather evidence (claim report, photos, unboxing video).\n3. Contact AlbumBuddy support with your documentation.\n\nClaim deadlines: FedEx — 21 days, UPS — 14 days.',
  },
  {
    category: 'Shipping',
    q: 'Are customs duties and taxes included in the shipping fee?',
    a: "No, shipping fees do not include customs duties or taxes.\n\nCosts are determined by the destination country's customs authorities and are the recipient's responsibility. Return shipping fees are non-refundable if customs clearance fails.",
  },
  {
    category: 'Shipping',
    q: 'What items cannot be shipped internationally?',
    a: 'For security reasons, AlbumBuddy does not ship the following:\n\n• Valuables (artwork, antiques, jewelry, money, credit cards)\n• Fragile items and perishables\n• Plants and uncontrolled food products\n• Hazardous materials (batteries, perfumes, chemicals)\n\nSome hazardous materials may ship under specific conditions.',
  },
  {
    category: 'Shipping',
    q: 'What is dimensional weight?',
    a: 'Dimensional weight is a measure based on the size of the package rather than its actual weight.\n\nCarriers calculate shipping costs using the greater value between actual weight and dimensional weight.\n\nFormula: (Length × Width × Height) ÷ Dimensional Factor',
  },
  {
    category: 'Shipping',
    q: 'Can I reship a package that was returned?',
    a: 'Yes, but additional costs may apply depending on the reason for the return.\n\nReshipping is possible after settling return shipping fees and any associated costs. Please contact AlbumBuddy support for assistance.',
  },
  {
    category: 'Shipping',
    q: 'Customs requested additional information about the package.',
    a: "Customs may request additional details regarding your package to verify the product's composition, materials, etc.\n\n• If you used a purchasing agency: AlbumBuddy will verify details with the seller on your behalf.\n• If you only used a shipping agency: please contact the seller directly.",
  },
  {
    category: 'Shipping',
    q: 'I want to modify the package value on the invoice.',
    a: 'For packages with the "Inclusion only" or "POB only" options selected, you can directly modify the value during the checkout stage.\n\nPlease note: undervaluing packages may cause customs issues. We strongly recommend declaring realistic values to avoid fines or package seizure.',
  },
  {
    category: 'Shipping',
    q: 'I want to know if my package has arrived at the logistics center.',
    a: 'The relevant department verifies packages in the order they arrive and uploads them to the system. Generally, packages are expected to be registered within 1–3 business days.\n\nPlease provide your order number or tracking number when contacting support for a status check.',
  },
  {
    category: 'Shipping',
    q: 'There is a note saying that repackaging is required. How do I request repackaging?',
    a: 'If the responsible team determines that a package needs to be repackaged, a repackaging instruction label will be added to the package.\n\nAutomatic repackaging occurs before delivery even if you selected the direct shipment option.',
  },
  {
    category: 'Shipping',
    q: 'I want to change the packaging method.',
    a: 'If packaging has already started, changes cannot be made.\n\nPlease provide your package number and our team will check if a change is possible. If feasible, they may cancel the current packaging and allow resubmission.',
  },
];

// 기본 인기 순서 (클릭 데이터 없을 때 폴백)
export const popularityOrder = [
  11, 15, 16, 14, 3, 26, 20, 21, 10, 17, 12, 13, 0, 4, 5, 22, 23, 18, 19, 9, 6, 7, 8, 24, 25, 27,
  28, 1, 2, 29,
];

// 카테고리 → i18n 키 매핑
export const categoryKeyMap: Record<string, string> = {
  Shipping: '배송 관련 문의',
  Order: '주문 관련 문의',
  Account: '계정 관련 문의',
};
