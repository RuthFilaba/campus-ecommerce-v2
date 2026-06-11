import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { socket, connectSocket } from "../../services/socket";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faImage, faSpinner } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

export default function ChatWindow({ chat, onlineUsers, onMessageSent }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const isOnline = onlineUsers[chat.other_user_id] === true;

  useEffect(() => {
    if (!chat?.id) return;
    
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/chat/${chat.id}/messages/`);
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        setMessages(data);
        scrollToBottom();
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [chat?.id]);

  useEffect(() => {
    if (!chat?.id || !user?.id) return;
    
    connectSocket(user.id);
    
    socket.emit("join_chat", { chatId: chat.id, userId: user.id });
    
    const handleReceiveMessage = (data) => {
      if (data.conversation_id === chat.id || data.chat_id === chat.id) {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
        api.post(`/chat/${chat.id}/mark-read/`);
      }
    };
    
    const handleTyping = (data) => {
      if (data.chat_id === chat.id && data.user_id !== user.id) {
        setOtherUserTyping(true);
        setTimeout(() => setOtherUserTyping(false), 2000);
      }
    };
    
    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    
    api.post(`/chat/${chat.id}/mark-read/`);
    
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.emit("leave_chat", { chatId: chat.id, userId: user.id });
    };
  }, [chat?.id, user?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleTypingIndicator = (e) => {
    setNewMessage(e.target.value);
    
    if (!typing) {
      setTyping(true);
      socket.emit("typing", { chatId: chat.id, userId: user.id, isTyping: true });
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit("typing", { chatId: chat.id, userId: user.id, isTyping: false });
    }, 1000);
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || sending) return;
    
    setSending(true);
    
    try {
      const formData = new FormData();
      formData.append('thread_id', chat.id);
      formData.append('message', newMessage);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      const response = await api.post('/chat/send-message/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        const newMsg = response.data.data;
        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        setAttachments([]);
        scrollToBottom();
        
        socket.emit("send_message", {
          chat_id: chat.id,
          conversation_id: chat.id,
          message: newMessage,
          sender_id: user.id,
          receiver_id: chat.other_user_id,
          created_at: new Date().toISOString()
        });
        
        if (onMessageSent) onMessageSent();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit("typing", { chatId: chat.id, userId: user.id, isTyping: false });
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-amber-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      <ChatHeader chat={chat} isOnline={isOnline} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              message={msg}
              isOwn={msg.sender === user?.id || msg.sender_id === user?.id}
              isRead={msg.is_read}
              isDelivered={msg.delivered}
            />
          ))
        )}
        
        {otherUserTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t flex gap-2 overflow-x-auto">
          {attachments.map((file, idx) => (
            <div key={idx} className="relative flex-shrink-0">
              <img src={URL.createObjectURL(file)} alt="Preview" className="w-12 h-12 rounded object-cover" />
              <button onClick={() => removeAttachment(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 border-t p-4">
        <div className="flex gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-amber-500 rounded-lg transition-colors">
            <FontAwesomeIcon icon={faImage} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" accept="image/*" />
          
          <input
            type="text"
            value={newMessage}
            onChange={handleTypingIndicator}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600"
            disabled={sending}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && attachments.length === 0) || sending}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {sending ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faPaperPlane} />}
          </button>
        </div>
      </div>
    </div>
  );
}
