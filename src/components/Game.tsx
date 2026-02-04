'use client';

import { useRef, useEffect } from 'react';
import { useGame } from '@/hooks/useGame';
import { Board } from './Board';
import { NextPuyo } from './NextPuyo';
import { ScorePanel } from './ScorePanel';
import { GameOverModal } from './GameOverModal';

export function Game() {
  const { state, actions } = useGame();
  const gameRef = useRef<HTMLDivElement>(null);

  // タッチ操作用
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const threshold = 30;

      if (absDx < threshold && absDy < threshold) {
        // タップ → 回転
        actions.rotate();
      } else if (absDx > absDy) {
        // 横スワイプ
        if (dx > 0) {
          actions.moveRight();
        } else {
          actions.moveLeft();
        }
      } else {
        // 縦スワイプ
        if (dy > 0) {
          actions.softDrop();
        }
      }

      touchStartRef.current = null;
    };

    const element = gameRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [actions]);

  const isNewHighScore = state.score >= state.highScore && state.score > 0;

  return (
    <div
      ref={gameRef}
      className="
        min-h-screen
        flex
        flex-col
        items-center
        justify-center
        p-4
        select-none
      "
    >
      {/* タイトル */}
      <h1
        className="
          text-4xl
          sm:text-5xl
          font-black
          mb-6
          bg-gradient-to-r
          from-cyan-400
          via-purple-400
          to-pink-400
          bg-clip-text
          text-transparent
          drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]
        "
      >
        ぷよぷよ
      </h1>

      {/* ゲームエリア */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* 左サイドパネル（PC） */}
        <div className="hidden sm:block">
          <ScorePanel
            score={state.score}
            highScore={state.highScore}
            chainCount={state.chainCount}
            level={state.level}
          />
        </div>

        {/* ボード */}
        <Board
          board={state.board}
          currentPair={state.currentPair}
          clearingPositions={state.clearingPositions}
        />

        {/* 右サイドパネル */}
        <div className="flex flex-row sm:flex-col gap-4">
          {/* モバイル用スコア */}
          <div className="sm:hidden">
            <div className="text-center p-2 rounded-lg bg-gray-900/80 border border-white/10">
              <div className="text-xs text-gray-400">Score</div>
              <div className="text-lg font-bold font-mono text-white">
                {state.score.toLocaleString()}
              </div>
              {state.chainCount > 0 && (
                <div className="text-sm font-bold text-purple-400 animate-pulse">
                  {state.chainCount} Chain!
                </div>
              )}
            </div>
          </div>

          {/* Next */}
          <NextPuyo pairs={state.nextPairs} />

          {/* サウンドボタン */}
          <button
            onClick={actions.toggleSound}
            className="
              p-3
              rounded-xl
              bg-gray-900/80
              backdrop-blur-md
              border
              border-white/10
              text-gray-400
              hover:text-white
              hover:border-white/30
              transition-all
              duration-200
            "
            aria-label={state.isSoundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {state.isSoundEnabled ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 操作説明 */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        <div className="hidden sm:block">
          <span className="inline-flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">←</kbd>
            <kbd className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">→</kbd>
            Move
          </span>
          <span className="mx-4">|</span>
          <span className="inline-flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">↑</kbd>
            <kbd className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">Z</kbd>
            Rotate
          </span>
          <span className="mx-4">|</span>
          <span className="inline-flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">↓</kbd>
            Soft Drop
          </span>
          <span className="mx-4">|</span>
          <span className="inline-flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">Space</kbd>
            Hard Drop
          </span>
        </div>
        <div className="sm:hidden">
          Swipe to move | Tap to rotate
        </div>
      </div>

      {/* ゲームオーバーモーダル */}
      {state.phase === 'gameover' && (
        <GameOverModal
          score={state.score}
          highScore={state.highScore}
          maxChainCount={state.maxChainCount}
          isNewHighScore={isNewHighScore}
          onRestart={actions.restart}
        />
      )}
    </div>
  );
}
