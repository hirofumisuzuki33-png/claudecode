'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  GamePhase,
  DROP_SPEEDS,
} from '@/types/game';
import {
  createEmptyBoard,
  generatePair,
  createCurrentPair,
  movePairLeft,
  movePairRight,
  movePairDown,
  rotatePairCW,
  placePair,
  applyGravity,
  processClear,
  clearPuyos,
  calculateScore,
  isGameOver,
  hardDrop,
  canPlacePair,
  needsGravity,
} from '@/lib/gameLogic';
import { soundManager } from '@/lib/sounds';

const INITIAL_LEVEL = 1;
const CLEAR_ANIMATION_DURATION = 300;
const CHAIN_DELAY = 200;

function getInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPair: null,
    nextPairs: [],  // 空に変更（クライアント側で生成してハイドレーションエラーを防止）
    phase: 'playing',
    score: 0,
    highScore: 0,
    chainCount: 0,
    maxChainCount: 0,
    level: INITIAL_LEVEL,
    totalCleared: 0,
    clearingPositions: [],
    isSoundEnabled: true,
  };
}

export function useGame() {
  const [state, setState] = useState<GameState>(getInitialState);
  const dropTimerRef = useRef<number | null>(null);
  const lastDropTimeRef = useRef<number>(0);

  // ハイスコアとサウンド設定をロード、nextPairsを初期化
  useEffect(() => {
    const savedHighScore = localStorage.getItem('puyoHighScore');
    soundManager.loadSetting();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loading saved state from localStorage on mount
    setState(prev => ({
      ...prev,
      highScore: savedHighScore ? parseInt(savedHighScore, 10) : 0,
      isSoundEnabled: soundManager.isEnabled(),
      nextPairs: prev.nextPairs.length === 0
        ? [generatePair(), generatePair()]
        : prev.nextPairs,
    }));
  }, []);

  // 新しい組ぷよをスポーン
  const spawnNewPair = useCallback(() => {
    setState(prev => {
      const [nextPair, ...remainingPairs] = prev.nextPairs;
      const newCurrentPair = createCurrentPair(nextPair);

      // スポーン位置に配置できない場合はゲームオーバー
      if (!canPlacePair(prev.board, newCurrentPair)) {
        soundManager.playGameOver();
        return {
          ...prev,
          phase: 'gameover' as GamePhase,
          currentPair: null,
        };
      }

      return {
        ...prev,
        currentPair: newCurrentPair,
        nextPairs: [...remainingPairs, generatePair()],
        chainCount: 0,
        phase: 'playing' as GamePhase,
      };
    });
  }, []);

  // 連鎖処理
  const processChain = useCallback(() => {
    setState(prev => {
      const result = processClear(prev.board);

      if (!result) {
        // 連鎖終了、ゲームオーバーチェック
        if (isGameOver(prev.board)) {
          soundManager.playGameOver();
          const newHighScore = Math.max(prev.score, prev.highScore);
          localStorage.setItem('puyoHighScore', newHighScore.toString());
          return {
            ...prev,
            phase: 'gameover' as GamePhase,
            highScore: newHighScore,
          };
        }

        // 新しい組ぷよをスポーン
        return {
          ...prev,
          phase: 'playing' as GamePhase,
        };
      }

      // 消去あり
      const newChainCount = prev.chainCount + 1;
      const scoreGain = calculateScore(result.clearedCount, newChainCount);
      soundManager.playClear(newChainCount);

      return {
        ...prev,
        clearingPositions: result.positions,
        chainCount: newChainCount,
        maxChainCount: Math.max(newChainCount, prev.maxChainCount),
        score: prev.score + scoreGain,
        totalCleared: prev.totalCleared + result.clearedCount,
        phase: 'clearing' as GamePhase,
      };
    });
  }, []);

  // 消去アニメーション後の処理
  useEffect(() => {
    if (state.phase === 'clearing') {
      const timer = setTimeout(() => {
        setState(prev => {
          const clearedBoard = clearPuyos(prev.board, prev.clearingPositions);
          return {
            ...prev,
            board: clearedBoard,
            clearingPositions: [],
            phase: 'dropping' as GamePhase,
          };
        });
      }, CLEAR_ANIMATION_DURATION);

      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // 重力適用後の処理
  useEffect(() => {
    if (state.phase === 'dropping') {
      const timer = setTimeout(() => {
        setState(prev => {
          if (needsGravity(prev.board)) {
            const droppedBoard = applyGravity(prev.board);
            return {
              ...prev,
              board: droppedBoard,
            };
          }
          // 重力適用完了、連鎖チェック
          return {
            ...prev,
            phase: 'chaining' as GamePhase,
          };
        });
      }, CHAIN_DELAY);

      return () => clearTimeout(timer);
    }
  }, [state.phase, state.board]);

  // 連鎖チェック
  useEffect(() => {
    if (state.phase === 'chaining') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Game state machine requires phase transitions
      processChain();
    }
  }, [state.phase, processChain]);

  // プレイ中に新しい組ぷよがない場合はスポーン
  useEffect(() => {
    if (state.phase === 'playing' && !state.currentPair) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Game state machine requires spawning new pair
      spawnNewPair();
    }
  }, [state.phase, state.currentPair, spawnNewPair]);

  // 自動落下
  useEffect(() => {
    if (state.phase !== 'playing' || !state.currentPair) return;

    const dropInterval = DROP_SPEEDS[Math.min(state.level, 10)] || DROP_SPEEDS[10];

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastDropTimeRef.current >= dropInterval) {
        lastDropTimeRef.current = timestamp;

        setState(prev => {
          if (prev.phase !== 'playing' || !prev.currentPair) return prev;

          const moved = movePairDown(prev.board, prev.currentPair);
          if (moved) {
            return { ...prev, currentPair: moved };
          }

          // 着地
          soundManager.playDrop();
          const newBoard = placePair(prev.board, prev.currentPair);
          const droppedBoard = applyGravity(newBoard);

          return {
            ...prev,
            board: droppedBoard,
            currentPair: null,
            phase: 'chaining' as GamePhase,
          };
        });
      }

      dropTimerRef.current = requestAnimationFrame(gameLoop);
    };

    dropTimerRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (dropTimerRef.current) {
        cancelAnimationFrame(dropTimerRef.current);
      }
    };
  }, [state.phase, state.level, state.currentPair]);

  // レベルアップ
  useEffect(() => {
    const newLevel = Math.min(10, Math.floor(state.totalCleared / 30) + 1);
    if (newLevel !== state.level) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Level up based on cleared count
      setState(prev => ({ ...prev, level: newLevel }));
    }
  }, [state.totalCleared, state.level]);

  // 左移動
  const moveLeft = useCallback(() => {
    if (state.phase !== 'playing' || !state.currentPair) return;
    setState(prev => {
      if (!prev.currentPair) return prev;
      const moved = movePairLeft(prev.board, prev.currentPair);
      if (moved) {
        soundManager.playMove();
        return { ...prev, currentPair: moved };
      }
      return prev;
    });
  }, [state.phase, state.currentPair]);

  // 右移動
  const moveRight = useCallback(() => {
    if (state.phase !== 'playing' || !state.currentPair) return;
    setState(prev => {
      if (!prev.currentPair) return prev;
      const moved = movePairRight(prev.board, prev.currentPair);
      if (moved) {
        soundManager.playMove();
        return { ...prev, currentPair: moved };
      }
      return prev;
    });
  }, [state.phase, state.currentPair]);

  // 回転
  const rotate = useCallback(() => {
    if (state.phase !== 'playing' || !state.currentPair) return;
    setState(prev => {
      if (!prev.currentPair) return prev;
      const rotated = rotatePairCW(prev.board, prev.currentPair);
      if (rotated) {
        soundManager.playRotate();
        return { ...prev, currentPair: rotated };
      }
      return prev;
    });
  }, [state.phase, state.currentPair]);

  // ソフトドロップ（高速落下）
  const softDrop = useCallback(() => {
    if (state.phase !== 'playing' || !state.currentPair) return;
    setState(prev => {
      if (!prev.currentPair) return prev;
      const moved = movePairDown(prev.board, prev.currentPair);
      if (moved) {
        return { ...prev, currentPair: moved };
      }
      return prev;
    });
  }, [state.phase, state.currentPair]);

  // ハードドロップ（即落下）
  const doHardDrop = useCallback(() => {
    if (state.phase !== 'playing' || !state.currentPair) return;
    setState(prev => {
      if (!prev.currentPair) return prev;
      const dropped = hardDrop(prev.board, prev.currentPair);
      soundManager.playDrop();
      const newBoard = placePair(prev.board, dropped);
      const droppedBoard = applyGravity(newBoard);

      return {
        ...prev,
        board: droppedBoard,
        currentPair: null,
        phase: 'chaining' as GamePhase,
      };
    });
  }, [state.phase, state.currentPair]);

  // サウンド切り替え
  const toggleSound = useCallback(() => {
    setState(prev => {
      const newEnabled = !prev.isSoundEnabled;
      soundManager.setEnabled(newEnabled);
      return { ...prev, isSoundEnabled: newEnabled };
    });
  }, []);

  // リスタート
  const restart = useCallback(() => {
    setState(prev => ({
      ...getInitialState(),
      highScore: prev.highScore,
      isSoundEnabled: prev.isSoundEnabled,
    }));
  }, []);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.phase === 'gameover') {
        if (e.key === 'Enter' || e.key === ' ') {
          restart();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowUp':
        case 'z':
        case 'Z':
          e.preventDefault();
          rotate();
          break;
        case 'ArrowDown':
          e.preventDefault();
          softDrop();
          break;
        case ' ':
          e.preventDefault();
          doHardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, moveLeft, moveRight, rotate, softDrop, doHardDrop, restart]);

  return {
    state,
    actions: {
      moveLeft,
      moveRight,
      rotate,
      softDrop,
      hardDrop: doHardDrop,
      toggleSound,
      restart,
    },
  };
}
