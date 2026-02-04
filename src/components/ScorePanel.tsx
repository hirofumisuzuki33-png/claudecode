'use client';

import { useEffect, useState } from 'react';

interface ScorePanelProps {
  score: number;
  highScore: number;
  chainCount: number;
  level: number;
}

// スコアのカウントアップアニメーション用フック
function useAnimatedNumber(target: number, duration: number = 300): number {
  const [current, setCurrent] = useState(target);

  useEffect(() => {
    const start = current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, current]);

  return current;
}

export function ScorePanel({ score, highScore, chainCount, level }: ScorePanelProps) {
  const animatedScore = useAnimatedNumber(score);

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
      {/* スコア */}
      <div className="text-center">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Score
        </div>
        <div
          className={`
            text-2xl
            sm:text-3xl
            font-bold
            font-mono
            text-white
            transition-all
            ${score > animatedScore ? 'scale-110' : 'scale-100'}
          `}
        >
          {animatedScore.toLocaleString()}
        </div>
      </div>

      {/* ハイスコア */}
      <div className="text-center">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          High Score
        </div>
        <div className="text-lg font-bold font-mono text-yellow-400">
          {highScore.toLocaleString()}
        </div>
      </div>

      {/* 連鎖表示 */}
      {chainCount > 0 && (
        <div
          className="
            text-center
            py-2
            px-3
            rounded-lg
            bg-gradient-to-r
            from-purple-600/50
            to-pink-600/50
            border
            border-purple-400/30
            animate-pulse
          "
        >
          <div className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
            Chain
          </div>
          <div
            className="
              text-3xl
              font-black
              bg-gradient-to-r
              from-purple-300
              to-pink-300
              bg-clip-text
              text-transparent
              animate-bounce
            "
          >
            {chainCount}
          </div>
        </div>
      )}

      {/* レベル */}
      <div className="text-center">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Level
        </div>
        <div className="text-lg font-bold text-cyan-400">
          {level}
        </div>
      </div>
    </div>
  );
}
