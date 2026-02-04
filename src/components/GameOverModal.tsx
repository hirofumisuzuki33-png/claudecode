'use client';

interface GameOverModalProps {
  score: number;
  highScore: number;
  maxChainCount: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export function GameOverModal({
  score,
  highScore,
  maxChainCount,
  isNewHighScore,
  onRestart,
}: GameOverModalProps) {
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-sm
        animate-fade-in
      "
    >
      <div
        className="
          relative
          p-8
          rounded-2xl
          bg-gray-900/95
          border
          border-white/20
          shadow-[0_0_50px_rgba(0,0,0,0.5)]
          max-w-sm
          w-full
          mx-4
          text-center
          animate-slide-up
        "
      >
        {/* タイトル */}
        <h2
          className="
            text-3xl
            font-black
            mb-6
            bg-gradient-to-r
            from-red-400
            to-orange-400
            bg-clip-text
            text-transparent
          "
        >
          Game Over
        </h2>

        {/* ハイスコア更新 */}
        {isNewHighScore && (
          <div
            className="
              mb-4
              py-2
              px-4
              rounded-full
              bg-gradient-to-r
              from-yellow-500/20
              to-amber-500/20
              border
              border-yellow-400/30
              animate-pulse
            "
          >
            <span className="text-yellow-300 font-bold">
              New High Score!
            </span>
          </div>
        )}

        {/* 結果 */}
        <div className="space-y-4 mb-8">
          <div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              Final Score
            </div>
            <div className="text-4xl font-bold font-mono text-white">
              {score.toLocaleString()}
            </div>
          </div>

          <div className="flex justify-center gap-8">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                High Score
              </div>
              <div className="text-xl font-bold font-mono text-yellow-400">
                {highScore.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                Max Chain
              </div>
              <div className="text-xl font-bold font-mono text-purple-400">
                {maxChainCount}
              </div>
            </div>
          </div>
        </div>

        {/* リトライボタン */}
        <button
          onClick={onRestart}
          className="
            w-full
            py-3
            px-6
            rounded-xl
            bg-gradient-to-r
            from-cyan-500
            to-blue-500
            text-white
            font-bold
            text-lg
            transition-all
            duration-200
            hover:from-cyan-400
            hover:to-blue-400
            hover:scale-105
            hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]
            active:scale-95
            focus:outline-none
            focus:ring-2
            focus:ring-cyan-400
            focus:ring-offset-2
            focus:ring-offset-gray-900
          "
        >
          Retry
        </button>

        <p className="mt-4 text-xs text-gray-500">
          Press Enter or Space to retry
        </p>
      </div>
    </div>
  );
}
