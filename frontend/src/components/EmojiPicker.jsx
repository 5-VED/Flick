import React, { useState } from 'react';
import { Search } from 'lucide-react';

const EMOJIS = {
  '😊 Smileys': [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😇',
    '😍','🥰','😘','😗','😚','😙','🥲','😋','😛','😜',
    '🤪','😝','🤑','🤗','🤭','🫢','🤫','🤔','😐','😑',
    '😶','😏','😒','🙄','😬','🤥','😔','😪','🤤','😴',
    '😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯',
    '😎','🥸','🤩','🥳','😞','😟','😤','😠','😡','🤬',
    '😢','😭','😩','😫','🥺','😖','😣','😧','😦','😮',
    '😲','🤧','😱','😳','🫠','🥹','😻','😸','😹','😺',
  ],
  '👋 Gestures': [
    '👍','👎','👏','🙌','🤝','🤜','🤛','✊','👊','🤚',
    '✋','🖐','👆','👇','👈','👉','☝️','👌','🤌','🤏',
    '✌️','🤞','🖖','🤙','💪','🦾','🫵','🫶','❤️','🧡',
    '💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕',
    '💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☯️',
  ],
  '🎉 Celebration': [
    '🎉','🎊','🎈','🎂','🎁','🏆','🥇','🥈','🥉','🏅',
    '🎖','🎗','🎀','🎆','🎇','✨','⭐','🌟','💫','⚡',
    '🔥','💥','🎵','🎶','🎤','🎸','🎹','🥁','🎺','🎻',
  ],
  '🌍 Nature': [
    '🌸','🌺','🌻','🌹','🌷','🌼','💐','🍀','🌿','🌱',
    '🌲','🌳','🌴','🌵','🍁','🍂','🍃','🌾','🍄','🌊',
    '🌈','☀️','🌙','⭐','❄️','🔥','💧','🌍','🌎','🌏',
  ],
  '🍕 Food': [
    '🍕','🍔','🌮','🌯','🥗','🍜','🍝','🍣','🍱','🍛',
    '🍤','🍗','🥩','🧆','🥚','🍳','🥞','🧇','🥓','🌭',
    '🍟','🧀','🥪','🥙','🧈','🍰','🎂','🧁','🍩','🍪',
    '☕','🍵','🧃','🍺','🥤','🧋',
  ],
  '🚀 Objects': [
    '💻','📱','🖥','⌨️','🖱','🖨','📷','📸','📹','🎥',
    '📺','📻','🎮','🕹','💾','💿','📀','📡','🔋','🔌',
    '💡','🔦','🕯','🧲','🔧','🔨','⚙️','🔩','🛠','🚗',
    '✈️','🚀','🛸','🏠','🏢','🌐','💰','💳','💎','👑',
  ],
};

const EmojiPicker = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(Object.keys(EMOJIS)[0]);

  const allEmojis = Object.values(EMOJIS).flat();
  const filtered = search
    ? allEmojis.filter(e => e.includes(search))
    : EMOJIS[activeTab];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-72 overflow-hidden">
      {/* Search */}
      <div className="p-2 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search emoji..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="flex overflow-x-auto border-b border-gray-100 px-1">
          {Object.keys(EMOJIS).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-2 py-1.5 text-base flex-shrink-0 rounded transition-colors ${
                activeTab === cat ? 'bg-primary/10' : 'hover:bg-gray-50'
              }`}
              title={cat}
            >
              {cat.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className="p-2 h-44 overflow-y-auto">
        <div className="grid grid-cols-8 gap-0.5">
          {filtered.map((emoji, i) => (
            <button
              key={i}
              onClick={() => { onSelect(emoji); onClose?.(); }}
              className="text-xl p-1 rounded hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              {emoji}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-8 text-center text-gray-400 text-sm py-4">No results</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
