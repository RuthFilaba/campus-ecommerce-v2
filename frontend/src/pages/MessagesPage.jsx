import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faSearch, 
  faPaperPlane, 
  faSpinner, 
  faCheck,
  faCheckDouble,
  faArrowLeft,
  faComment,
  faImage,
  faTag,
  faBox,
  faHome,
  faBoxOpen,
  faClock,
  faTruck,
  faMoneyBillWave,
  faQuestionCircle,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons"
import { Link, useNavigate, useLocation } from "react-router-dom"
import toast from "react-hot-toast"

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showMobileSidebar, setShowMobileSidebar] = useState(true)
  const [typing, setTyping] = useState(false)
  const [showQuickQuestions, setShowQuickQuestions] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)

  // Quick questions for buyers
  const quickQuestions = [
    { text: "Is this still available?", icon: faBoxOpen, color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
    { text: "What's the condition like?", icon: faCheckCircle, color: "bg-green-50 hover:bg-green-100 text-green-700" },
    { text: "Can we meet on campus?", icon: faTruck, color: "bg-purple-50 hover:bg-purple-100 text-purple-700" },
    { text: "Is the price negotiable?", icon: faMoneyBillWave, color: "bg-amber-50 hover:bg-amber-100 text-amber-700" },
    { text: "Can I see more photos?", icon: faImage, color: "bg-pink-50 hover:bg-pink-100 text-pink-700" },
    { text: "When can we meet?", icon: faClock, color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700" },
  ]

  useEffect(() => {
    if (selectedChat && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [selectedChat])

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/my-chats/')
      
      let data = []
      if (response.data.results) {
        data = response.data.results
      } else if (Array.isArray(response.data)) {
        data = response.data
      }
      
      const processedData = data.map(chat => {
        const otherUser = chat.other_user || {}
        let otherUserName = otherUser.full_name || otherUser.email?.split('@')[0] || "User"
        const otherUserId = chat.buyer_id === user?.id ? chat.seller_id : chat.buyer_id
        
        return {
          ...chat,
          other_user_id: otherUserId,
          other_user_name: otherUserName,
          other_user_role: otherUser.role,
          other_user_email: otherUser.email,
          last_message_preview: chat.last_message?.message?.substring(0, 50) || "No messages yet"
        }
      })
      
      setConversations(processedData)
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for a thread
  const fetchMessages = async (threadId) => {
    try {
      const response = await api.get(`/chat/${threadId}/messages/`)
      let data = []
      if (response.data.results) {
        data = response.data.results
      } else if (Array.isArray(response.data)) {
        data = response.data
      }
      setMessages(data)
      scrollToBottom()
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  // Send a message
  const sendMessage = async (messageText = null) => {
    const msgToSend = messageText || newMessage
    if (!msgToSend.trim() || !selectedChat || sending) return

    setSending(true)
    try {
      const response = await api.post('/chat/send-message/', {
        thread_id: selectedChat.id,
        message: msgToSend
      })
      
      if (response.data.success) {
        const newMsg = response.data.data
        setMessages(prev => [...prev, newMsg])
        setNewMessage("")
        scrollToBottom()
        fetchConversations()
        // Hide quick questions after sending first message
        setShowQuickQuestions(false)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  // Send a quick question
  const sendQuickQuestion = async (question) => {
    if (!selectedChat) return
    await sendMessage(question.text)
  }

  // Mark thread as read
  const markThreadAsRead = async (threadId) => {
    try {
      await api.post(`/chat/${threadId}/mark-read/`)
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  // Handle thread selection
  const handleSelectThread = async (thread) => {
    setSelectedChat(thread)
    await fetchMessages(thread.id)
    await markThreadAsRead(thread.id)
    setShowMobileSidebar(false)
    // Show quick questions when selecting a thread that has product details
    setShowQuickQuestions(!!thread.product_details)
  }

  const handleBackToList = () => {
    setSelectedChat(null)
    setShowMobileSidebar(true)
    setShowQuickQuestions(false)
    fetchConversations()
  }

  const handleGoHome = () => {
    navigate("/")
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    if (!typing) {
      setTyping(true)
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false)
    }, 1000)
  }

  // Handle navigation from product page with product context
  useEffect(() => {
    const handleProductChat = async () => {
      const state = location.state
      if (!state || !state.productId) return
      
      console.log("Opening chat for product:", state.productId, state.productName)
      
      try {
        let existingThread = null
        const threadsRes = await api.get('/chat/my-chats/')
        let threads = []
        if (threadsRes.data.results) {
          threads = threadsRes.data.results
        } else if (Array.isArray(threadsRes.data)) {
          threads = threadsRes.data
        }
        
        for (const thread of threads) {
          const otherUserId = thread.buyer_id === user?.id ? thread.seller_id : thread.buyer_id
          if (otherUserId === state.sellerId) {
            existingThread = thread
            break
          }
        }
        
        if (existingThread) {
          console.log("Found existing thread:", existingThread.id)
          const threadWithProduct = {
            ...existingThread,
            product_details: {
              name: state.productName,
              price: state.productPrice,
              primary_image: state.productImage,
              id: state.productId
            }
          }
          setSelectedChat(threadWithProduct)
          await fetchMessages(existingThread.id)
          await markThreadAsRead(existingThread.id)
          setShowMobileSidebar(false)
          // ALWAYS show quick questions when opening from product page
          setShowQuickQuestions(true)
        } else {
          console.log("Creating new thread for product:", state.productId)
          const createResponse = await api.post('/chat/create-thread/', {
            product_id: state.productId,
            initial_message: state.initialMessage || `Hi! I'm interested in your product: ${state.productName}`
          })
          
          if (createResponse.data.success) {
            const newThread = createResponse.data.thread
            const threadWithProduct = {
              ...newThread,
              product_details: {
                name: state.productName,
                price: state.productPrice,
                primary_image: state.productImage,
                id: state.productId
              }
            }
            setSelectedChat(threadWithProduct)
            await fetchMessages(newThread.id)
            setShowMobileSidebar(false)
            // ALWAYS show quick questions when opening from product page
            setShowQuickQuestions(true)
            await fetchConversations()
          }
        }
      } catch (error) {
        console.error("Failed to open chat:", error)
        toast.error("Failed to open chat")
      } finally {
        navigate(location.pathname, { replace: true, state: {} })
      }
    }
    
    if (isAuthenticated && location.state?.productId) {
      handleProductChat()
    }
  }, [location.state, isAuthenticated])

  // Poll for new messages
  useEffect(() => {
    if (selectedChat) {
      const interval = setInterval(() => {
        fetchMessages(selectedChat.id)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedChat?.id])

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
    }
  }, [isAuthenticated])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()
    const diffMins = Math.floor((now - date) / 60000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
    return `${Math.floor(diffMins / 1440)}d`
  }

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return date.toLocaleDateString()
  }

  const getAvatarInitials = (name) => {
    if (!name || name === "User") return "U"
    const parts = name.split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const getAvatarColor = (id) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500", 
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-orange-500"
    ]
    return colors[(id || 0) % colors.length]
  }

  const getMessageStatusIcon = (msg) => {
    if (msg.is_read) return <FontAwesomeIcon icon={faCheckDouble} className="text-green-500 text-xs" />
    return <FontAwesomeIcon icon={faCheck} className="text-gray-400 text-xs" />
  }

  const filteredConversations = conversations.filter(c => 
    searchTerm === "" || c.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Login to Chat</h2>
          <p className="text-gray-500 text-sm">Please login to view your messages</p>
          <button onClick={() => navigate("/login")} className="mt-4 inline-block bg-amber-500 text-white px-6 py-2 rounded-lg">Login Now</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-6.75rem)] min-h-[28rem] min-w-0 overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className={`${!showMobileSidebar ? "hidden md:flex" : "flex"} w-full md:w-96 bg-white border-r flex-col`}>
        <div className="p-4 border-b bg-white sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>
          <button onClick={handleGoHome} className="p-2 text-gray-600 hover:text-amber-500 rounded-lg hover:bg-gray-100">
            <FontAwesomeIcon icon={faHome} className="text-lg" />
          </button>
        </div>

        <div className="p-3 border-b">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faComment} className="text-gray-400 text-3xl" />
              </div>
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Start a conversation from a product page</p>
            </div>
          ) : (
            filteredConversations.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectThread(chat)}
                className={`p-3 border-b cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedChat?.id === chat.id ? "bg-amber-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${getAvatarColor(chat.id)}`}>
                    {getAvatarInitials(chat.other_user_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-gray-900 truncate">{chat.other_user_name}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatTime(chat.last_message_time)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.last_message_preview}</p>
                    {chat.product_details?.name && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        <FontAwesomeIcon icon={faTag} className="text-[10px] mr-1" />
                        {chat.product_details.name}
                      </p>
                    )}
                  </div>
                  {chat.unread_count > 0 && (
                    <div className="flex-shrink-0">
                      <span className="bg-amber-500 text-white text-xs font-medium rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                        {chat.unread_count}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-white">
          <div className="bg-white border-b px-4 py-3 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={handleBackToList} className="p-2 text-gray-600 hover:text-amber-500 rounded-full hover:bg-gray-100">
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(selectedChat.id)}`}>
                {getAvatarInitials(selectedChat.other_user_name)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedChat.other_user_name}</p>
                <p className="text-xs text-gray-500">
                  {selectedChat.other_user_role === "seller" ? "Seller" : "Buyer"}
                </p>
              </div>
            </div>
          </div>

          {/* Product Context Card */}
          {selectedChat.product_details && (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border-b p-3">
              <div className="flex items-start gap-3">
                {selectedChat.product_details.primary_image ? (
                  <img 
                    src={selectedChat.product_details.primary_image} 
                    alt={selectedChat.product_details.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-amber-200 dark:bg-amber-800 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faBox} className="text-amber-600 dark:text-amber-300 text-xl" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800 dark:text-white">
                    {selectedChat.product_details.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Price: K{selectedChat.product_details.price}
                  </p>
                  <Link 
                    to={`/products/${selectedChat.product_details.id}`}
                    className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline mt-1 inline-block"
                  >
                    View Product ?
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick Questions - Always show when opening from product page */}
          {showQuickQuestions && selectedChat.product_details && (
            <div className="p-4 border-b bg-gray-50">
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                <FontAwesomeIcon icon={faQuestionCircle} className="text-amber-500" />
                Quick questions to ask the seller:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuickQuestion(q)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${q.color}`}
                  >
                    <FontAwesomeIcon icon={q.icon} className="text-xs" />
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FontAwesomeIcon icon={faComment} className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-gray-500 font-medium">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center my-4">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {formatDate(messages[0]?.created_at)}
                  </span>
                </div>
                
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender === user?.id || msg.sender_id === user?.id
                  let messageText = ""
                  
                  if (typeof msg.message === 'string') {
                    messageText = msg.message
                  } else if (msg.message && typeof msg.message === 'object') {
                    messageText = msg.message.message || msg.message.text || "Message"
                  } else if (msg.text) {
                    messageText = msg.text
                  }
                  
                  return (
                    <div key={idx} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                        <div className={`relative px-4 py-2 rounded-2xl ${
                          isOwn ? "bg-amber-500 text-white rounded-br-sm" : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{messageText}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[10px] text-gray-400">{formatMessageTime(msg.created_at)}</span>
                          {isOwn && getMessageStatusIcon(msg)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {typing && (
            <div className="px-4 py-1">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}

          <div className="bg-white border-t p-3 sticky bottom-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1 border">
              <button className="p-2 text-gray-500 hover:text-amber-500 rounded-full">
                <FontAwesomeIcon icon={faImage} className="text-lg" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-2 py-2 text-sm bg-transparent focus:outline-none"
                disabled={sending}
                autoFocus
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {sending ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faComment} className="text-amber-500 text-4xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome to Messages</h2>
            <p className="text-sm text-gray-500">Select a conversation to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}
