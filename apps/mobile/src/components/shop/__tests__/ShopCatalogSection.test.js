import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderScreen } from '../../../test/renderScreen';
import ShopCatalogSection from '../ShopCatalogSection';

const products = [
  {
    key: 'p9',
    id: 'p9',
    name: 'Premium Valve Cap Set',
    category: 'Accessories',
    price: 250,
    stock: 0,
    availability: 'Out of Stock',
    description: 'Aluminum valve caps.',
    image: 'https://mock.autocare.local/catalog/valve-cap-set.jpg',
    publishedAt: '2026-04-08T10:05:00.000Z',
  },
  {
    key: 'p1',
    id: 'p1',
    name: 'Castrol GTX 10W-40 (4L)',
    category: 'Lubricants',
    price: 895,
    stock: 48,
    availability: 'In Stock',
    description: 'Synthetic blend engine oil.',
    image: 'https://mock.autocare.local/catalog/castrol-gtx-4l.jpg',
    publishedAt: '2026-04-01T09:15:00.000Z',
  },
];

describe('ShopCatalogSection', () => {
  test('filters by category and keeps out-of-stock products visible', () => {
    const screen = renderScreen(
      <ShopCatalogSection
        products={products}
        cartItems={{}}
        onAddToCart={jest.fn()}
        onOpenCart={jest.fn()}
        onOpenProduct={jest.fn()}
      />,
    );

    fireEvent.press(screen.getAllByText('Accessories')[0]);

    expect(screen.getByText('Premium Valve Cap Set')).toBeTruthy();
    expect(screen.getAllByText('Out of Stock').length).toBeGreaterThan(0);
    expect(screen.queryByText('Castrol GTX 10W-40 (4L)')).toBeNull();
  });

  test('sorts by price low to high', () => {
    const screen = renderScreen(
      <ShopCatalogSection
        products={products}
        cartItems={{}}
        onAddToCart={jest.fn()}
        onOpenCart={jest.fn()}
        onOpenProduct={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText('Sort'));
    fireEvent.press(screen.getByText('Price: Low to High'));

    const titles = screen.getAllByTestId('mobile-shop-title');
    expect(titles[0].props.children).toBe('Premium Valve Cap Set');
  });
});
