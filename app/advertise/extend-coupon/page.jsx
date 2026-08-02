import { Suspense } from 'react';
import ExtendCouponClient from './ExtendCouponClient';

export const metadata = {
  title: 'Extend Your Coupon | SimchaPro',
};

export default function ExtendCouponPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#141d33]">
          <p className="text-[#C9A227] font-serif text-lg">Loading...</p>
        </div>
      }
    >
      <ExtendCouponClient />
    </Suspense>
  );
}
