import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";

export default function ChatSidebar({ setActiveChat, activeChatId, onlineUsers }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/my-chats/');
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setChats(data);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUserOnline = (userId) => onlineUsers[userId] === true;

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold">Messages</h2>
        <p className="text-sm text-gray-500 mt-1">{chats.length} conversations</p>
      </div>

      <div className="p-3 border-b dark:border-gray-700">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-amber-500" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No conversations</p>
            <p className="text-xs text-gray-400 mt-1">Start chatting from a product page</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`p-4 border-b dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                activeChatId === chat.id ? "bg-amber-50 dark:bg-amber-900/20" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-500 font-semibold">
                      {chat.other_user_name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  {isUserOnline(chat.other_user_id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold truncate">{chat.other_user_name}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {chat.last_message_time ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.last_message || "No messages yet"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {chat.product_name && (
                      <span className="text-xs text-gray-400 truncate">?? {chat.product_name}</span>
                    )}
                    {chat.unread_count > 0 && (
                      <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
