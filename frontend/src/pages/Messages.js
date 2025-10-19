import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';

const Messages = ({ user }) => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserAndMessages(userId);
    }
  }, [userId]);

  const loadConversations = async () => {
    try {
      const response = await api.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAndMessages = async (uid) => {
    try {
      const [userResponse, messagesResponse] = await Promise.all([
        api.getUser(uid),
        api.getMessages(uid)
      ]);
      setSelectedUser(userResponse.data);
      setMessages(messagesResponse.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Error loading messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await api.sendMessage({
        receiver_id: selectedUser.id,
        content: newMessage.trim()
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]" data-testid="messages-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200" data-testid="conversations-list">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{t('messages')}</h2>
            </div>
            <ScrollArea className="h-[calc(100%-5rem)]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500" data-testid="no-conversations">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <Link
                    key={conv.user.id}
                    to={`/messages/${conv.user.id}`}
                    className={`flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 ${
                      selectedUser?.id === conv.user.id ? 'bg-gray-50' : ''
                    }`}
                    data-testid={`conversation-${conv.user.id}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {conv.user.username[0].toUpperCase()}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{conv.user.username}</div>
                      <div className="text-sm text-gray-500 truncate">{conv.last_message.content}</div>
                    </div>
                    {!conv.last_message.read && conv.last_message.receiver_id === user.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col" data-testid="message-area">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200" data-testid="message-header">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {selectedUser.username[0].toUpperCase()}
                    </div>
                    <Link to={`/profile/${selectedUser.id}`} className="ml-3">
                      <div className="font-semibold text-gray-900 hover:underline">{selectedUser.username}</div>
                    </Link>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" data-testid="messages-list">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${message.id}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            message.sender_id === user.id
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-gray-200" data-testid="message-input-area">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('type_message')}
                      className="flex-1"
                      data-testid="message-input"
                    />
                    <Button type="submit" size="icon" data-testid="send-message-btn">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400" data-testid="no-conversation-selected">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
