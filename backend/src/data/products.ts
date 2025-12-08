import type { Product } from '@/models/Product';

export const productsData: Product[] = [
  {
    id: '1',
    name: 'Cricket Bat - Premium Willow',
    description: 'High-quality English willow cricket bat',
    price: 3500,
    category: 'sports_equipment',
    image: 'https://via.placeholder.com/300x200?text=Cricket+Bat',
    stock: 25,
    rating: 4.7,
    reviews: 56,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Football - Official Match Ball',
    description: 'FIFA approved match ball',
    price: 2200,
    category: 'sports_equipment',
    image: 'https://via.placeholder.com/300x200?text=Football',
    stock: 40,
    rating: 4.6,
    reviews: 73,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
