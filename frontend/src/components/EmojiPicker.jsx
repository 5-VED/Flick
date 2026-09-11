import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './EmojiPicker.css';

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
    <div className="emoji-root">
      {/* Search */}
      <div className="emoji-search-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search emoji..."
            className="emoji-search-input"
          />
        </div>
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="emoji-tabs">
          {Object.keys(EMOJIS).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`emoji-tab${activeTab === cat ? ' is-active' : ''}`}
              title={cat}
            >
              {cat.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className="emoji-grid-wrap">
        <div className="emoji-grid">
          {filtered.map((emoji, i) => (
            <button
              key={i}
              onClick={() => { onSelect(emoji); onClose?.(); }}
              className="emoji-btn"
            >
              {emoji}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="emoji-empty">No results</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
