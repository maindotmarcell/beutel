import { WalletData } from '../types/wallet';

export const mockWalletData: WalletData = {
  balance: 0.025,
  transactions: [
    {
      id: '1',
      type: 'receive',
      amount: 0.01,
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      status: 'confirmed',
      timestamp: new Date('2024-01-15T10:30:00'),
    },
    {
      id: '2',
      type: 'send',
      amount: 0.005,
      address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      status: 'confirmed',
      timestamp: new Date('2024-01-14T15:20:00'),
    },
    {
      id: '3',
      type: 'receive',
      amount: 0.02,
      address: 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3',
      status: 'pending',
      timestamp: new Date('2024-01-13T09:15:00'),
    },
    {
      id: '4',
      type: 'send',
      amount: 0.001,
      address: 'bc1q9vza2e8x573nczrlzms0wvx3gsqjx7vavgkx0l',
      status: 'failed',
      timestamp: new Date('2024-01-12T14:45:00'),
    },
    {
      id: '5',
      type: 'receive',
      amount: 0.008,
      address: 'bc1q7x8k2j9fjq4q5q6q7q8q9q0q1q2q3q4q5q6q7q8q9q0q1q2q3q4q5q6',
      status: 'confirmed',
      timestamp: new Date('2024-01-11T11:00:00'),
    },
    {
      id: '6',
      type: 'send',
      amount: 0.003,
      address: 'bc1q4x8k2j9fjq4q5q6q7q8q9q0q1q2q3q4q5q6q7q8q9q0q1q2q3q4q5q6',
      status: 'confirmed',
      timestamp: new Date('2024-01-10T16:30:00'),
    },
    {
      id: '7',
      type: 'receive',
      amount: 0.015,
      address: 'bc1q2x8k2j9fjq4q5q6q7q8q9q0q1q2q3q4q5q6q7q8q9q0q1q2q3q4q5q6',
      status: 'pending',
      timestamp: new Date('2024-01-09T08:20:00'),
    },
    {
      id: '8',
      type: 'send',
      amount: 0.002,
      address: 'bc1q1x8k2j9fjq4q5q6q7q8q9q0q1q2q3q4q5q6q7q8q9q0q1q2q3q4q5q6',
      status: 'confirmed',
      timestamp: new Date('2024-01-08T13:10:00'),
    },
  ],
};

