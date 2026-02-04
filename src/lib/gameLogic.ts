import {
  Board,
  PuyoCell,
  PuyoColor,
  Position,
  CurrentPair,
  Pair,
  Rotation,
  ClearResult,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  PUYO_COLORS,
  CHAIN_BONUS,
} from '@/types/game';

// 空のボードを作成
export function createEmptyBoard(): Board {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null));
}

// ランダムなぷよの色を取得
export function getRandomColor(): PuyoColor {
  return PUYO_COLORS[Math.floor(Math.random() * PUYO_COLORS.length)];
}

// ランダムな組ぷよを生成
export function generatePair(): Pair {
  return {
    main: getRandomColor(),
    sub: getRandomColor(),
  };
}

// 回転に基づくサブぷよのオフセットを取得
export function getSubOffset(rotation: Rotation): Position {
  switch (rotation) {
    case 0: return { x: 0, y: -1 };  // 上
    case 1: return { x: 1, y: 0 };   // 右
    case 2: return { x: 0, y: 1 };   // 下
    case 3: return { x: -1, y: 0 };  // 左
  }
}

// 組ぷよのメインとサブの位置を取得
export function getPairPositions(current: CurrentPair): [Position, Position] {
  const mainPos = { x: current.x, y: current.y };
  const offset = getSubOffset(current.rotation);
  const subPos = { x: current.x + offset.x, y: current.y + offset.y };
  return [mainPos, subPos];
}

// 位置が有効かチェック
export function isValidPosition(x: number, y: number): boolean {
  return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
}

// 位置が空いているかチェック
export function isEmpty(board: Board, x: number, y: number): boolean {
  if (!isValidPosition(x, y)) return false;
  return board[y][x] === null;
}

// 組ぷよが配置可能かチェック
export function canPlacePair(board: Board, current: CurrentPair): boolean {
  const [mainPos, subPos] = getPairPositions(current);
  return (
    isValidPosition(mainPos.x, mainPos.y) &&
    isValidPosition(subPos.x, subPos.y) &&
    isEmpty(board, mainPos.x, mainPos.y) &&
    isEmpty(board, subPos.x, subPos.y)
  );
}

// 組ぷよを左に移動
export function movePairLeft(board: Board, current: CurrentPair): CurrentPair | null {
  const newCurrent = { ...current, x: current.x - 1 };
  return canPlacePair(board, newCurrent) ? newCurrent : null;
}

// 組ぷよを右に移動
export function movePairRight(board: Board, current: CurrentPair): CurrentPair | null {
  const newCurrent = { ...current, x: current.x + 1 };
  return canPlacePair(board, newCurrent) ? newCurrent : null;
}

// 組ぷよを下に移動
export function movePairDown(board: Board, current: CurrentPair): CurrentPair | null {
  const newCurrent = { ...current, y: current.y + 1 };
  return canPlacePair(board, newCurrent) ? newCurrent : null;
}

// 組ぷよを時計回りに回転
export function rotatePairCW(board: Board, current: CurrentPair): CurrentPair | null {
  const newRotation = ((current.rotation + 1) % 4) as Rotation;
  const newCurrent = { ...current, rotation: newRotation };

  // 通常回転が可能か
  if (canPlacePair(board, newCurrent)) {
    return newCurrent;
  }

  // 壁蹴り（右の壁）
  if (newCurrent.x === BOARD_WIDTH - 1 && newRotation === 1) {
    const kicked = { ...newCurrent, x: newCurrent.x - 1 };
    if (canPlacePair(board, kicked)) return kicked;
  }

  // 壁蹴り（左の壁）
  if (newCurrent.x === 0 && newRotation === 3) {
    const kicked = { ...newCurrent, x: newCurrent.x + 1 };
    if (canPlacePair(board, kicked)) return kicked;
  }

  // 床蹴り
  if (newRotation === 2) {
    const kicked = { ...newCurrent, y: newCurrent.y - 1 };
    if (canPlacePair(board, kicked)) return kicked;
  }

  return null;
}

// 組ぷよをボードに配置
export function placePair(board: Board, current: CurrentPair): Board {
  const newBoard = board.map(row => [...row]);
  const [mainPos, subPos] = getPairPositions(current);
  newBoard[mainPos.y][mainPos.x] = current.pair.main;
  newBoard[subPos.y][subPos.x] = current.pair.sub;
  return newBoard;
}

// 重力適用（ぷよを落下させる）
export function applyGravity(board: Board): Board {
  const newBoard = board.map(row => [...row]);

  for (let x = 0; x < BOARD_WIDTH; x++) {
    // 各列で下から詰める
    const column: PuyoCell[] = [];
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y][x] !== null) {
        column.push(newBoard[y][x]);
      }
    }

    // 列を再配置
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      const idx = BOARD_HEIGHT - 1 - y;
      newBoard[y][x] = idx < column.length ? column[idx] : null;
    }
  }

  return newBoard;
}

// BFSで連結したぷよを探索
export function findConnected(board: Board, startX: number, startY: number): Position[] {
  const color = board[startY][startX];
  if (!color) return [];

  const visited = new Set<string>();
  const connected: Position[] = [];
  const queue: Position[] = [{ x: startX, y: startY }];

  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  while (queue.length > 0) {
    const pos = queue.shift()!;
    const key = `${pos.x},${pos.y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    if (!isValidPosition(pos.x, pos.y)) continue;
    if (board[pos.y][pos.x] !== color) continue;

    connected.push(pos);

    for (const dir of directions) {
      queue.push({ x: pos.x + dir.x, y: pos.y + dir.y });
    }
  }

  return connected;
}

// 消去可能なぷよを検出
export function findClearable(board: Board): Position[] {
  const allClearable: Position[] = [];
  const checked = new Set<string>();

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const key = `${x},${y}`;
      if (checked.has(key)) continue;
      if (!board[y][x]) continue;

      const connected = findConnected(board, x, y);
      connected.forEach(pos => checked.add(`${pos.x},${pos.y}`));

      if (connected.length >= 4) {
        allClearable.push(...connected);
      }
    }
  }

  return allClearable;
}

// ぷよを消去
export function clearPuyos(board: Board, positions: Position[]): Board {
  const newBoard = board.map(row => [...row]);
  for (const pos of positions) {
    newBoard[pos.y][pos.x] = null;
  }
  return newBoard;
}

// 連鎖処理を実行し結果を返す
export function processClear(board: Board): ClearResult | null {
  const clearable = findClearable(board);
  if (clearable.length === 0) return null;

  return {
    clearedCount: clearable.length,
    positions: clearable,
  };
}

// スコア計算
export function calculateScore(clearedCount: number, chainCount: number): number {
  const bonus = CHAIN_BONUS[Math.min(chainCount, 10)] || CHAIN_BONUS[10];
  return clearedCount * 10 * bonus;
}

// 新しい組ぷよを生成（初期位置）
export function createCurrentPair(pair: Pair): CurrentPair {
  return {
    pair,
    x: 2,           // 中央（3列目、0インデックス）
    y: 1,           // サブぷよ（y=0）がボード内に収まるように
    rotation: 0,    // サブが上
  };
}

// ゲームオーバー判定
export function isGameOver(board: Board): boolean {
  // 3列目（インデックス2）の最上部（インデックス0）にぷよがあるか
  return board[0][2] !== null;
}

// ハードドロップ（即座に落下）
export function hardDrop(board: Board, current: CurrentPair): CurrentPair {
  let dropped = current;
  let next = movePairDown(board, dropped);

  while (next) {
    dropped = next;
    next = movePairDown(board, dropped);
  }

  return dropped;
}

// ボードが重力適用で変化するかチェック
export function needsGravity(board: Board): boolean {
  for (let x = 0; x < BOARD_WIDTH; x++) {
    let foundEmpty = false;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (board[y][x] === null) {
        foundEmpty = true;
      } else if (foundEmpty) {
        return true;
      }
    }
  }
  return false;
}
