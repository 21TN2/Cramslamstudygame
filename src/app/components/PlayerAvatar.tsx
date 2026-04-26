import { Player } from '../context/GameContext';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showScore?: boolean;
  highlight?: boolean;
  rank?: number;
}

const sizeMap = {
  sm: { outer: 'w-9 h-9', emoji: 'text-base', name: 'text-xs', score: 'text-xs' },
  md: { outer: 'w-12 h-12', emoji: 'text-xl', name: 'text-sm', score: 'text-xs' },
  lg: { outer: 'w-16 h-16', emoji: 'text-3xl', name: 'text-base', score: 'text-sm' },
  xl: { outer: 'w-24 h-24', emoji: 'text-5xl', name: 'text-lg', score: 'text-base' },
};

const rankColors: Record<number, string> = {
  1: 'ring-yellow-400 shadow-yellow-400/50',
  2: 'ring-gray-300 shadow-gray-400/40',
  3: 'ring-amber-600 shadow-amber-600/40',
};

export function PlayerAvatar({ player, size = 'md', showName = false, showScore = false, highlight = false, rank }: PlayerAvatarProps) {
  const s = sizeMap[size];
  const ringClass =
    rank && rankColors[rank]
      ? `ring-4 shadow-lg ${rankColors[rank]}`
      : highlight
      ? 'ring-4 ring-orange-400 shadow-orange-400/50 shadow-lg'
      : '';

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${s.outer} rounded-full flex items-center justify-center relative select-none ${player.colorClass} ${ringClass}`}
        style={{ border: '2px solid rgba(255,255,255,0.15)' }}
      >
        <span className={s.emoji}>{player.emoji}</span>
        {player.isHost && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-yellow-400 rounded-full w-4 h-4 flex items-center justify-center">
            👑
          </span>
        )}
      </div>
      {showName && (
        <span className={`${s.name} font-semibold text-white/90 truncate max-w-[80px] text-center`}>
          {player.name}
        </span>
      )}
      {showScore && (
        <span className={`${s.score} font-bold text-yellow-400`}>{player.score.toLocaleString()}</span>
      )}
    </div>
  );
}
