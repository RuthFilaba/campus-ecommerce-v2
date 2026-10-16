import { useState, useEffect, useRef, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPaperPlane,
  faUsers,
  faUser,
  faStore,
  faSpinner,
  faArrowLeft,
  faCheckCircle,
  faCheckDouble,
  faImage,
  faPaperclip,
  faBox,
  faTruck,
  faMoneyBillWave,
  faExclamationTriangle,
  faTag,
  faClock,
  faEye
} from "@fortawesome/free-solid-svg-icons"
import toast from "react-hot-toast"

const ChatPage = () => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Helper to safely get message text
  const getMessageText = (msg) => {
    if (!msg) return ""
    if (typeof msg === 'string') return msg
    if (msg.message && typeof msg.message === 'string') return msg.message
    if (msg.text && typeof msg.text === 'string') return msg.text
    if (msg.content && typeof msg.content === 'string') return msg.content
    return ""
  }

  // Fetch threads
  const fetchThreads = async () => {
    try {
      const response = await api.get('/chat/my-chats/')
      let threadsData = []
      if (response.data.results) {
        threadsData = response.data.results
      } else if (Array.isArray(response.data)) {
        threadsData = response.data
      }

      const processedThreads = threadsData.map(thread => ({
        ...thread,
        last_message_display: getMessageText(thread.last_message)
      }))

      setThreads(processedThreads)
    } catch (error) {
      console.error("Failed to fetch threads:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages
  const fetchMessages = async (threadId) => {
    try {
      const response = await api.get(`/chat/${threadId}/messages/`)
      let messagesArray = []
      if (response.data.results) {
        messagesArray = response.data.results
      } else if (Array.isArray(response.data)) {
        messagesArray = response.data
      }

      setMessages(messagesArray)
      scrollToBottom()
    } catch (error) {
      console.error("Failed to fetch messages:", error)
      setMessages([])
    }
  }

  // Send text message
  const sendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !selectedThread || sending) return

    setSending(true)
    try {
      const formData = new FormData()
      formData.append('thread_id', selectedThread.id)
      formData.append('message', newMessage)

      attachments.forEach(file => {
        formData.append('images', file)
      })

      const response = await api.post('/chat/send-message/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.data])
        setNewMessage("")
        setAttachments([])
        scrollToBottom()
        fetchThreads()
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  // Upload image
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploadingImage(true)
    for (const file of files) {
      const formData = new FormData()
      formData.append('thread_id', selectedThread.id)
      formData.append('image', file)

      try {
        const response = await api.post('/chat/upload-image/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (response.data.success) {
          setMessages(prev => [...prev, response.data.data])
          scrollToBottom()
        }
      } catch (error) {
        console.error("Failed to upload image:", error)
        toast.error("Failed to upload image")
      }
    }
    setUploadingImage(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Quick Actions
  const sendQuickAction = async (actionType) => {
    let message = ""
    switch(actionType) {
      case "track":
        message = "Can you please provide tracking information for my order?"
        break
      case "meetup":
        message = "What's the best time and location for meetup?"
        break
      case "payment":
        message = "Can you confirm the payment status?"
        break
      case "issue":
        message = "I have an issue with my order. Please assist."
        break
      case "availability":
        message = "Is this item still available?"
        break
      case "negotiate":
        message = "Is the price negotiable?"
        break
      default:
        return
    }
    setNewMessage(message)
    await sendMessage()
  }

  // Select thread
  const handleSelectThread = async (thread) => {
    setSelectedThread(thread)
    await fetchMessages(thread.id)
  }

  // Create thread from product
  useEffect(() => {
    if (location.state?.productId && isAuthenticated) {
      const createThread = async () => {
        try {
          const response = await api.post('/chat/create-thread/', {
            product_id: location.state.productId,
            initial_message: location.state.initialMessage || "Hi! I'm interested in this product."
          })
          if (response.data.success) {
            toast.success(response.data.message)
            await fetchThreads()
            if (response.data.thread) {
              setSelectedThread(response.data.thread)
              await fetchMessages(response.data.thread.id)
            }
          }
        } catch (error) {
          console.error("Failed to create thread:", error)
          toast.error("Failed to start chat")
        }
        navigate(location.pathname, { replace: true, state: {} })
      }
      createThread()
    }
  }, [location.state, isAuthenticated])

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchThreads()
    }
  }, [isAuthenticated])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  // Get status icon
  const getMessageStatusIcon = (msg) => {
    if (msg.is_read) return <FontAwesomeIcon icon={faCheckDouble} className="text-xs text-green-500 ml-1" />
    if (msg.delivered) return <FontAwesomeIcon icon={faCheckDouble} className="text-xs text-gray-400 ml-1" />
    return <FontAwesomeIcon icon={faCheckCircle} className="text-xs text-gray-400 ml-1" />
  }

  // Check if thread has order context
  const hasOrderContext = selectedThread?.order_id
  const hasProductContext = selectedThread?.product_id && !hasOrderContext

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FontAwesomeIcon icon={faUsers} className="text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login to Chat</h2>
          <p className="text-gray-500">Please login to view your messages</p>
          <button onClick={() => navigate("/login")} className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg">Login Now</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-6.75rem)] min-h-[28rem] min-w-0 flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md py-4 px-6">
        {selectedThread ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedThread(null)} className="text-gray-600 hover:text-amber-500">
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  {selectedThread.buyer_id === user?.id ? selectedThread.seller_name : selectedThread.buyer_name}
                </h2>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FontAwesomeIcon icon={faClock} className="text-xs" />
                  Active now
                </span>
              </div>
              {/* Context Badge - Order or Product */}
              {hasOrderContext ? (
                <div className="flex items-center gap-2 text-xs mt-1 flex-wrap">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <FontAwesomeIcon icon={faBox} className="text-xs" />
                    Order #{selectedThread.order_id}
                  </span>
                  <span className="text-gray-500">{selectedThread.order_status || "Pending"}</span>
                  <span className="text-gray-500">Total: K {selectedThread.order_total}</span>
                </div>
              ) : hasProductContext ? (
                <div className="flex items-center gap-2 text-xs mt-1 flex-wrap">
                  <img src={selectedThread.product_image} alt="" className="w-6 h-6 rounded object-cover" />
                  <span className="font-medium">{selectedThread.product_name}</span>
                  <span className="text-gray-500">K {selectedThread.product_price}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="text-amber-500 text-xl" />
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
        )}
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {/* Threads Sidebar */}
        <div className={`${selectedThread ? "hidden md:flex" : "flex"} w-full md:w-80 bg-white dark:bg-gray-800 border-r flex-col`}>
          <div className="p-4 border-b">
            <h2 className="font-semibold">Conversations</h2>
            <p className="text-xs text-gray-500">{threads.length} conversations</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-amber-500" /></div>
            ) : threads.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-400 mb-3" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400">Start chatting from a product page</p>
              </div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => handleSelectThread(thread)}
                  className={`p-4 border-b cursor-pointer transition-all ${selectedThread?.id === thread.id ? "bg-amber-50 dark:bg-amber-900/20" : "hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={thread.seller_id === user?.id ? faStore : faUser} className="text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold truncate">
                          {thread.buyer_id === user?.id ? thread.seller_name : thread.buyer_name}
                        </p>
                        {thread.unread_count > 0 && (
                          <span className="bg-amber-500 text-white text-xs rounded-full px-2 ml-2">{thread.unread_count}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{thread.last_message_display || "No messages yet"}</p>
                      <p className="text-xs text-gray-400 truncate mt-1">{thread.product_name}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedThread ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
          {selectedThread ? (
            <>
              {/* Quick Action Buttons - Premium Feature */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 border-b overflow-x-auto">
                <div className="flex gap-2">
                  {hasOrderContext ? (
                    <>
                      <button onClick={() => sendQuickAction("track")} className="px-3 py-1.5 bg-white dark:bg-gray-600 rounded-full text-sm hover:bg-amber-100 transition-colors whitespace-nowrap flex items-center gap-1">
                        <FontAwesomeIcon icon={faTruck} className="text-amber-500 text-xs" /> Track Order
                      </button>
                      <button onClick={() => sendQuickAction("meetup")} className="px-3 py-1.5 bg-white dark:bg-gray-600 rounded-full text-sm hover:bg-amber-100 transition-colors whitespace-nowrap flex items-center gap-1">
                        <FontAwesomeIcon icon={faBox} className="text-amber-500 text-xs" /> Meetup
                      </button>
                      <button onClick={() => sendQuickAction("payment")} className="px-3 py-1.5 bg-white dark:bg-gray-600 rounded-full text-sm hover:bg-amber-100 transition-colors whitespace-nowrap flex items-center gap-1">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-amber-500 text-xs" /> Payment
                      </button>
                      <button onClick={() => sendQuickAction("issue")} className="px-3 py-1.5 bg-white dark:bg-gray-600 rounded-full text-sm hover:bg-amber-100 transition-colors whitespace-nowrap flex items-center gap-1">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 text-xs" /> Report Issue
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => sendQuickAction("availability")} className="px-3 py-1.5 bg-white dark:bg-gray-600 rounded-full text-sm hover:bg-amber-100 transition-colors whitespace-nowrap flex items-center gap-1">
                        <FontAwesomeIcon icon={faTag} className="text-amber-500 text-xs" /> Is this available?
                      </button>
                      <button onClick={() => sendQuickAction("negotiate")} className="px-3 py-1.5 bg-white dark:bg-gray-600 rounded-full text-sm hover:bg-amber-100 transition-colors whitespace-nowrap flex items-center gap-1">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-amber-500 text-xs" /> Negotiate Price
                      </button>
                      <button onClick={() => sendQuickAction("meetup")} className="px-3 py-1.5 bg-white dark:bg-gray-600 rounded-full text-sm hover:bg-amber-100 transition-colors whitespace-nowrap flex items-center gap-1">
                        <FontAwesomeIcon icon={faBox} className="text-amber-500 text-xs" /> Delivery Options
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const messageText = getMessageText(msg)
                    const isMyMessage = msg.sender === user?.id || msg.sender_id === user?.id
                    const timestamp = msg.created_at || msg.timestamp
                    const isSystem = msg.type === "system"

                    if (isSystem) {
                      return (
                        <div key={idx} className="flex justify-center">
                          <div className="bg-gray-200 dark:bg-gray-700 text-gray-500 text-xs px-3 py-1 rounded-full max-w-[80%] text-center">
                            {messageText}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={idx} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] ${isMyMessage ? "order-1" : "order-0"}`}>
                          <div className={`rounded-lg px-4 py-2 ${isMyMessage ? "bg-amber-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"}`}>
                            <p className="text-sm break-words">{messageText}</p>
                            {msg.image_url && (
                              <img src={msg.image_url} alt="Attachment" className="mt-2 rounded max-w-full max-h-40 object-cover cursor-pointer" onClick={() => window.open(msg.image_url)} />
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <p className="text-xs text-gray-400">
                              {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                            </p>
                            {isMyMessage && getMessageStatusIcon(msg)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input with Attachment */}
              <div className="bg-white dark:bg-gray-800 border-t p-4">
                <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-amber-500" disabled={uploadingImage}>
                    {uploadingImage ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faImage} />}
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && attachments.length === 0) || sending}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {sending ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faPaperPlane} />}
                  </button>
                </div>
                {attachments.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{file.name}</div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FontAwesomeIcon icon={faUsers} className="text-6xl text-gray-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Select a conversation</h2>
                <p className="text-gray-500">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage
