import React from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';

const MessageBubble = ({ message, isMe }) => {
  const time = message.created_at ? format(new Date(message.created_at), 'HH:mm') : '';

  return (
    <div className={clsx('flex mb-2', isMe ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[70%] px-4 py-2 rounded-2xl relative shadow-sm',
          isMe
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={clsx('text-[10px] mt-1 text-right', isMe ? 'text-blue-100' : 'text-gray-400')}
        >
          {time}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
