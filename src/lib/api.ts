// ... existing imports

export async function getSupplierOrders() {
  // Simulate API request
  return {
    success: true,
    data: [
      {
        id: '123',
        status: 'SELESAI',
        total: 500000,
        items: [
          { name: 'Beras', quantity: 100, unitPrice: 12000 },
          { name: 'Ayam', quantity: 50, unitPrice: 25000 }
        ],
        paymentProof: '/public/struk_transfer_INV-202405-771.jpg' // Example path
      },
      {
        id: '456',
        status: 'BARU',
        total: 300000,
        items: [
          { name: 'Sayur', quantity: 80, unitPrice: 10000 }
        ]
      }
    ]
  };
}

// ... existing functions