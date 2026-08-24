'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import JoinClient from './JoinClient';
import { Loader2 } from 'lucide-react';

function JoinContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'SPRINT1';
  return <JoinClient code={code} />;
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
