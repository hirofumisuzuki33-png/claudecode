// ぷよの色
export type PuyoColor = 'red' | 'blue' | 'green' | 'yellow';

// ぷよセル（色またはnull）
export type PuyoCell = PuyoColor | null;

// ボード（6列×13行：12行 + 上部の見えない1行）
export type Board = PuyoCell[][];

// 組ぷよ（2つのぷよが縦に連結）
export interface Pair {
  main: PuyoColor;      // メイン（軸）ぷよ
  sub: PuyoColor;       // サブ（回転する）ぷよ
}

// 組ぷよの回転状態（0: 上, 1: 右, 2: 下, 3: 左）
export type Rotation = 0 | 1 | 2 | 3;

// 現在操作中の組ぷよ
export interface CurrentPair {
  pair: Pair;
  x: number;            // メインぷよのX座標（0-5）
  y: number;            // メインぷよのY座標（0-12）
  rotation: Rotation;   // 回転状態
}

// 座標
export interface Position {
  x: number;
  y: number;
}

// ゲームフェーズ
export type GamePhase =
  | 'playing'           // プレイ中（組ぷよ操作）
  | 'dropping'          // 自動落下中
  | 'clearing'          // 消去アニメーション中
  | 'chaining'          // 連鎖処理中
  | 'gameover';         // ゲームオーバー

// ゲーム状態
export interface GameState {
  board: Board;
  currentPair: CurrentPair | null;
  nextPairs: Pair[];           // 次の組ぷよ（2つ分）
  phase: GamePhase;
  score: number;
  highScore: number;
  chainCount: number;          // 現在の連鎖数
  maxChainCount: number;       // 最大連鎖数
  level: number;               // レベル（落下速度に影響）
  totalCleared: number;        // 累計消去数
  clearingPositions: Position[];  // 消去中のぷよの位置
  isSoundEnabled: boolean;
}

// スコア計算用
export interface ClearResult {
  clearedCount: number;
  positions: Position[];
}

// フィールドサイズ
export const BOARD_WIDTH = 6;
export const BOARD_HEIGHT = 13;  // 12行 + 見えない1行
export const VISIBLE_HEIGHT = 12;

// 死亡判定位置（3列目の最上部）
export const DEATH_X = 2;
export const DEATH_Y = 0;

// ぷよの色リスト
export const PUYO_COLORS: PuyoColor[] = ['red', 'blue', 'green', 'yellow'];

// 連鎖ボーナス倍率
export const CHAIN_BONUS: Record<number, number> = {
  1: 1,
  2: 4,
  3: 8,
  4: 16,
  5: 32,
  6: 64,
  7: 128,
  8: 256,
  9: 512,
  10: 999,
};

// 落下速度（レベル別、ミリ秒）
export const DROP_SPEEDS: Record<number, number> = {
  1: 1000,
  2: 900,
  3: 800,
  4: 700,
  5: 600,
  6: 500,
  7: 400,
  8: 300,
  9: 200,
  10: 150,
};
