'use client';

import { Board as BoardType, CurrentPair, Position, BOARD_WIDTH, VISIBLE_HEIGHT } from '@/types/game';
import { getPairPositions } from '@/lib/gameLogic';
import { Puyo } from './Puyo';

interface BoardProps {
  board: BoardType;
  currentPair: CurrentPair | null;
  clearingPositions: Position[];
}

export function Board({ board, currentPair, clearingPositions }: BoardProps) {
  // 消去中の位置をSetに変換
  const clearingSet = new Set(clearingPositions.map(p => `${p.x},${p.y}`));

  // 現在の組ぷよの位置
  let mainPos: Position | null = null;
  let subPos: Position | null = null;
  if (currentPair) {
    [mainPos, subPos] = getPairPositions(currentPair);
  }

  // 見える範囲のボードをレンダリング（12行）
  const visibleBoard = board.slice(1, 1 + VISIBLE_HEIGHT);

  return (
    <div className="relative">
      {/* ゲームボード */}
      <div
        className="
          grid
          gap-0.5
          p-2
          rounded-xl
          bg-gray-900/80
          backdrop-blur-md
          border
          border-white/10
          shadow-[0_0_30px_rgba(0,0,0,0.5)]
        "
        style={{
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
          gridTemplateRows: `repeat(${VISIBLE_HEIGHT}, 1fr)`,
        }}
      >
        {visibleBoard.map((row, y) =>
          row.map((cell, x) => {
            const boardY = y + 1; // 実際のボード座標（0行目は見えない）
            const isClearing = clearingSet.has(`${x},${boardY}`);

            // 現在の組ぷよをチェック
            const isMainPuyo = mainPos && mainPos.x === x && mainPos.y === boardY;
            const isSubPuyo = subPos && subPos.x === x && subPos.y === boardY;

            let displayColor = cell;
            if (isMainPuyo && currentPair) {
              displayColor = currentPair.pair.main;
            } else if (isSubPuyo && currentPair) {
              displayColor = currentPair.pair.sub;
            }

            return (
              <div
                key={`${x}-${y}`}
                className="
                  w-8 h-8
                  sm:w-10 sm:h-10
                  md:w-12 md:h-12
                  bg-gray-800/50
                  rounded-md
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-100
                "
              >
                {displayColor && (
                  <div className="w-[90%] h-[90%] animate-bounce-in">
                    <Puyo color={displayColor} isClearing={isClearing} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 死亡ライン表示 */}
      <div
        className="
          absolute
          top-2
          left-2
          right-2
          h-0.5
          bg-red-500/30
          pointer-events-none
        "
        style={{
          top: `calc(0.5rem + ${(12 / VISIBLE_HEIGHT) * 0.5}rem)`,
        }}
      />
    </div>
  );
}
