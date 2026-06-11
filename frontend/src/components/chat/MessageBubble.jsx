import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckDouble } from "@fortawesome/free-solid-svg-icons";

export default function MessageBubble({ message, isOwn, isRead, isDelivered }) {
  const isSystem = message.type === "system";
  const hasImage = message.image_url;

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-200 dark:bg-gray-700 text-gray-500 text-xs px-3 py-1 rounded-full max-w-[80%] text-center">
          {message.text || message.message}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[70%] ${isOwn ? "order-1" : "order-0"}`}>
        {hasImage && (
          <img 
            src={message.image_url} 
            alt="Attachment" 
            className="rounded-lg mb-1 max-w-full max-h-48 object-cover cursor-pointer"
            onClick={() => window.open(message.image_url, '_blank')}
          />
        )}
        <div className={`rounded-lg px-4 py-2 ${
          isOwn 
            ? "bg-amber-500 text-white" 
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
        }`}>
          <p className="text-sm break-words whitespace-pre-wrap">{message.text || message.message}</p>
        </div>
        <div className="flex items-center gap-1 mt-1 justify-end">
          <span className="text-xs text-gray-400">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && (
            <span className="text-xs">
              {isRead ? (
                <FontAwesomeIcon icon={faCheckDouble} className="text-green-500" />
              ) : isDelivered ? (
                <FontAwesomeIcon icon={faCheckDouble} className="text-gray-400" />
              ) : (
                <FontAwesomeIcon icon={faCheck} className="text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
