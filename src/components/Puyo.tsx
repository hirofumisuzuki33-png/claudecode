'use client';

import { PuyoColor } from '@/types/game';

interface PuyoProps {
  color: PuyoColor;
  isClearing?: boolean;
  size?: 'normal' | 'small';
}

const colorClasses: Record<PuyoColor, { bg: string; glow: string; highlight: string }> = {
  red: {
    bg: 'bg-gradient-to-br from-red-400 via-red-500 to-red-600',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.7)]',
    highlight: 'bg-red-300/50',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.7)]',
    highlight: 'bg-blue-300/50',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-400 via-green-500 to-green-600',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.7)]',
    highlight: 'bg-green-300/50',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500',
    glow: 'shadow-[0_0_15px_rgba(234,179,8,0.7)]',
    highlight: 'bg-yellow-200/50',
  },
};

export function Puyo({ color, isClearing = false, size = 'normal' }: PuyoProps) {
  const { bg, glow, highlight } = colorClasses[color];

  const sizeClass = size === 'normal' ? 'w-full h-full' : 'w-6 h-6';

  return (
    <div className={`${sizeClass} relative`}>
      {/* メインボディ（スライム形状） */}
      <div
        className={`
          w-full h-full
          ${bg}
          transition-all
          duration-150
          ${isClearing ? `${glow} animate-pulse scale-110` : ''}
        `}
        style={{
          borderRadius: '50% 50% 55% 45% / 50% 50% 55% 50%',
          boxShadow: isClearing
            ? undefined
            : 'inset -2px -2px 4px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.2)',
        }}
      >
        {/* ハイライト（つやつや感） */}
        <div
          className={`absolute top-[10%] left-[15%] w-[30%] h-[25%] ${highlight} rounded-full`}
          style={{ filter: 'blur(1px)' }}
        />
      </div>

      {/* 顔 - 絶対位置で配置 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 左目 */}
        <div
          className="absolute bg-white rounded-full"
          style={{ width: '30%', height: '30%', top: '20%', left: '15%' }}
        >
          <div
            className="absolute bg-gray-900 rounded-full"
            style={{ width: '70%', height: '70%', bottom: '10%', left: '15%' }}
          >
            {/* メインのキラキラ */}
            <div
              className="absolute bg-white rounded-full"
              style={{ width: '40%', height: '40%', top: '10%', right: '10%' }}
            />
            {/* サブのキラキラ */}
            <div
              className="absolute bg-white rounded-full"
              style={{ width: '18%', height: '18%', top: '45%', right: '25%' }}
            />
          </div>
        </div>

        {/* 右目 */}
        <div
          className="absolute bg-white rounded-full"
          style={{ width: '30%', height: '30%', top: '20%', right: '15%' }}
        >
          <div
            className="absolute bg-gray-900 rounded-full"
            style={{ width: '70%', height: '70%', bottom: '10%', left: '15%' }}
          >
            {/* メインのキラキラ */}
            <div
              className="absolute bg-white rounded-full"
              style={{ width: '40%', height: '40%', top: '10%', right: '10%' }}
            />
            {/* サブのキラキラ */}
            <div
              className="absolute bg-white rounded-full"
              style={{ width: '18%', height: '18%', top: '45%', right: '25%' }}
            />
          </div>
        </div>

        {/* 左ほっぺ */}
        <div
          className="absolute bg-pink-400/50 rounded-full"
          style={{ width: '22%', height: '15%', top: '50%', left: '5%', filter: 'blur(1px)' }}
        />

        {/* 右ほっぺ */}
        <div
          className="absolute bg-pink-400/50 rounded-full"
          style={{ width: '22%', height: '15%', top: '50%', right: '5%', filter: 'blur(1px)' }}
        />

        {/* 口 - にっこり */}
        <div
          className="absolute border-b-2 border-gray-900/80"
          style={{ width: '20%', height: '10%', top: '65%', left: '40%', borderRadius: '0 0 50% 50%' }}
        />
      </div>
    </div>
  );
}
