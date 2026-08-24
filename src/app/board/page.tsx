'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BoardClient from './BoardClient';
import { Loader2 } from 'lucide-react';

function BoardContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || 'sprint-1';
  return <BoardClient id={id} />;
}

export default function BoardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      }
    >
      <BoardContent />
    </Suspense>
  );
}
