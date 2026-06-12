#!/usr/bin/env python
"""
WebSocket Chat Test Client
Run this script to test real-time chat functionality
"""

import websocket
import json
import threading
import time
import sys

# ============================================
# REPLACE THIS WITH YOUR ACTUAL JWT TOKEN
# ============================================
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgxMzc3ODc0LCJpYXQiOjE3ODEyOTE0NzQsImp0aSI6ImY4MWUwYjJiZTJlYzQzZmQ4Mjk5NjUyYTA4MWI5MmE5IiwidXNlcl9pZCI6MTl9.Bzzo2pdfWKl90e6v1IoD_84WxfClyVPXdc42Pt9gvTk"
# ============================================

# Configuration
THREAD_ID = 1  # Change to an existing chat thread ID
WS_URL = f"ws://localhost:8000/ws/chat/{THREAD_ID}/"

message_count = 0
received_messages = []

def on_message(ws, message):
    """Handle incoming WebSocket messages"""
    global message_count, received_messages
    try:
        data = json.loads(message)
        message_count += 1
        received_messages.append(data)
        
        msg_type = data.get('type', 'unknown')
        
        if msg_type == 'message':
            sender = "Me" if data.get('is_mine') else data.get('sender_name', 'Unknown')
            print(f"\n💬 [{sender}]: {data.get('message')}")
            print(f"   📍 {data.get('created_at')}")
            if data.get('is_read'):
                print("   ✅ Read")
        
        elif msg_type == 'typing':
            if data.get('is_typing'):
                print(f"\n✏️ {data.get('user_name')} is typing...")
            else:
                print(f"\n✓ {data.get('user_name')} stopped typing")
        
        elif msg_type == 'read_receipt':
            print(f"\n👁️ Message {data.get('message_id')} read by user {data.get('reader_id')}")
        
        elif msg_type == 'user_status':
            status = "🟢 online" if data.get('status') == 'online' else "⚫ offline"
            print(f"\n{data.get('username')} is {status}")
        
        elif msg_type == 'unread_update':
            print(f"\n📬 Unread count for you: {data.get('unread_count')}")
        
        else:
            print(f"\n📨 Unknown message type: {msg_type}")
            print(f"   Data: {data}")
            
    except json.JSONDecodeError as e:
        print(f"Error parsing message: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

def on_error(ws, error):
    """Handle WebSocket errors"""
    print(f"❌ WebSocket Error: {error}")

def on_close(ws, close_status_code, close_msg):
    """Handle connection close"""
    print(f"\n🔌 Connection closed: {close_status_code} - {close_msg}")
    print(f"Total messages received: {message_count}")

def on_open(ws):
    """Handle connection open"""
    print("✅ Connected to WebSocket server!")
    print(f"📡 Chat Thread ID: {THREAD_ID}")
    print("=" * 50)
    print("Commands:")
    print("  - Type a message and press Enter to send")
    print("  - Type '/typing' to send typing indicator")
    print("  - Type '/quit' to exit")
    print("=" * 50)
    
    # Send initial typing indicator to show we're active
    ws.send(json.dumps({
        'type': 'typing',
        'is_typing': True
    }))
    
    # Stop typing after 2 seconds
    def stop_typing():
        time.sleep(2)
        ws.send(json.dumps({
            'type': 'typing',
            'is_typing': False
        }))
    
    threading.Thread(target=stop_typing, daemon=True).start()

def send_message(ws, message):
    """Send a message through WebSocket"""
    if message == '/quit':
        ws.close()
        return False
    elif message == '/typing':
        ws.send(json.dumps({
            'type': 'typing',
            'is_typing': True
        }))
        # Auto stop typing after 3 seconds
        def stop_typing():
            time.sleep(3)
            ws.send(json.dumps({
                'type': 'typing',
                'is_typing': False
            }))
        threading.Thread(target=stop_typing, daemon=True).start()
        print("✏️ Sent typing indicator")
    else:
        ws.send(json.dumps({
            'type': 'message',
            'message': message
        }))
        print(f"📤 Sent: {message}")
    
    return True

def input_thread(ws):
    """Handle user input in a separate thread"""
    while ws.sock and ws.sock.connected:
        try:
            user_input = input()
            if not send_message(ws, user_input):
                break
        except EOFError:
            break
        except Exception as e:
            print(f"Input error: {e}")
            break

def main():
    """Main function to run WebSocket client"""
    print("=" * 50)
    print("🚀 WebSocket Chat Client")
    print("=" * 50)
    print(f"Connecting to: {WS_URL}")
    print(f"Using token: {JWT_TOKEN[:50]}...")
    
    # Setup WebSocket with custom headers for authentication
    websocket.enableTrace(False)  # Set to True for debugging
    
    ws = websocket.WebSocketApp(
        WS_URL,
        header=[f"Authorization: Bearer {JWT_TOKEN}"],
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    
    # Start input thread
    input_thread_instance = threading.Thread(target=input_thread, args=(ws,), daemon=True)
    input_thread_instance.start()
    
    # Run WebSocket connection (blocking)
    ws.run_forever()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)