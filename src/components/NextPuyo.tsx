'use client';

import { Pair } from '@/types/game';
import { Puyo } from './Puyo';

interface NextPuyoProps {
  pairs: Pair[];
}

export function NextPuyo({ pairs }: NextPuyoProps) {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        p-4
        rounded-xl
        bg-gray-900/80
        backdrop-blur-md
        border
        border-white/10
      "
    >
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
        Next
      </h3>

      {pairs.map((pair, index) => (
        <div
          key={index}
          className={`
            flex
            flex-col
            items-center
            gap-1
            ${index === 0 ? '' : 'opacity-60 scale-90'}
          `}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10">
            <Puyo color={pair.sub} size="normal" />
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10">
            <Puyo color={pair.main} size="normal" />
          </div>
        </div>
      ))}
    </div>
  );
}
