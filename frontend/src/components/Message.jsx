import React from 'react';
import { format } from 'date-fns';
import { Pin, Trash2, PinOff } from 'lucide-react';

const Message = ({ message, currentUserId, onPin, onDelete }) => {
  const isMine = message.senderId === currentUserId;
  
  if (!message || (!message.text && !message.isDeletedForEveryone)) return null;

  const displayTime = message.timestamp ? format(new Date(message.timestamp), 'p') : '';

  return (
    <div className={`message-wrapper ${isMine ? 'mine' : 'others'} ${message.isDeletedForEveryone ? 'message-deleted' : ''} ${message.isPinned ? 'message-pinned' : ''}`}>
      <div className="message-sender">
        {isMine ? 'You' : message.senderName}
      </div>
      
      <div className="message-bubble">
        {message.isPinned && !message.isDeletedForEveryone && (
          <div className="pin-indicator">
            <Pin size={10} /> Pinned
          </div>
        )}
        {message.text}
      </div>

      <div className="message-footer">
        <span className="time">{displayTime}</span>
        
        {!message.isDeletedForEveryone && (
          <div className="message-actions">
            <button 
              className="action-btn pin" 
              onClick={() => onPin(message.id, !message.isPinned)}
              title={message.isPinned ? "Unpin message" : "Pin message"}
            >
              {message.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
            <div className="delete-options">
              {isMine && (
                <button 
                  className="action-btn delete" 
                  onClick={() => onDelete(message.id, 'everyone')}
                  title="Delete for everyone"
                >
                  <Trash2 size={14} color="#ef4444" />
                </button>
              )}
              <button 
                className="action-btn delete" 
                onClick={() => onDelete(message.id, 'me')}
                title="Delete for me"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Message);
