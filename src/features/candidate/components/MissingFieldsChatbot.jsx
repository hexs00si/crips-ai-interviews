import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { candidateInterview } from '@/data/candidateInterview';

export function MissingFieldsChatbot({ missingFields, extractedFields, onComplete }) {
  const { chatbot } = candidateInterview;
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [collectedInfo, setCollectedInfo] = useState({ ...extractedFields });
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const messagesEndRef = useRef(null);

  // Log only once on mount - inside useEffect
  useEffect(() => {
    console.log('[MissingFieldsChatbot] ========== COMPONENT MOUNTED ==========');
    console.log('[MissingFieldsChatbot] Props received:', {
      missingFields,
      extractedFields,
      onCompleteType: typeof onComplete
    });

    // Validate props
    if (!missingFields || missingFields.length === 0) {
      console.error('[MissingFieldsChatbot] ✗ ERROR: No missing fields provided!');
      // If no missing fields, complete immediately
      onComplete(extractedFields);
      return;
    }

    console.log('[MissingFieldsChatbot] Initializing with greeting message');

    // Get field labels
    const fieldLabels = missingFields.map(f => {
      if (f === 'name') return 'your full name';
      if (f === 'email') return 'your email address';
      if (f === 'phone') return 'your phone number';
      return f;
    }).join(', ');

    // Initial greeting
    const greetingMessage = {
      role: 'assistant',
      content: `Hi! I need to collect some information: ${fieldLabels}. Let's start!`
    };

    // Ask for first missing field
    const firstFieldMessage = {
      role: 'assistant',
      content: getQuestionForField(missingFields[0])
    };

    setMessages([greetingMessage, firstFieldMessage]);
    console.log('[MissingFieldsChatbot] Greeting set:', greetingMessage);
  }, []); // Empty dependency array - only run once

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getQuestionForField = (field) => {
    if (field === 'name') return "What's your full name?";
    if (field === 'email') return "What's your email address?";
    if (field === 'phone') return "What's your phone number?";
    return `Please provide your ${field}:`;
  };

  const validateField = (field, value) => {
    if (field === 'email') {
      const emailRegex = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;
      return emailRegex.test(value);
    }
    if (field === 'phone') {
      // Allow various phone formats
      const phoneRegex = /^[\d\s+()\-]{7,}$/;
      return phoneRegex.test(value);
    }
    if (field === 'name') {
      return value.trim().length >= 2;
    }
    return true;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const currentField = missingFields[currentFieldIndex];

      // Validate input
      if (!validateField(currentField, userMessage)) {
        let errorMsg = 'Please provide a valid value.';
        if (currentField === 'email') errorMsg = 'Please provide a valid email address (e.g., name@example.com).';
        if (currentField === 'phone') errorMsg = 'Please provide a valid phone number.';
        if (currentField === 'name') errorMsg = 'Please provide your full name (at least 2 characters).';

        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        setIsLoading(false);
        return;
      }

      // Save collected info
      const updatedInfo = {
        ...collectedInfo,
        [currentField]: userMessage
      };
      setCollectedInfo(updatedInfo);

      console.log('[MissingFieldsChatbot] Collected:', currentField, '=', userMessage);

      // Check if we have more fields to collect
      const nextIndex = currentFieldIndex + 1;

      if (nextIndex < missingFields.length) {
        // Ask for next field
        const nextField = missingFields[nextIndex];
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Great! Now, ${getQuestionForField(nextField)}` }
        ]);
        setCurrentFieldIndex(nextIndex);
      } else {
        // All fields collected!
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "Perfect! I have all the information I need. You're ready to start the interview!"
          }
        ]);

        console.log('[MissingFieldsChatbot] All fields collected:', updatedInfo);

        // Complete after a short delay
        setTimeout(() => {
          onComplete(updatedInfo);
        }, 1500);
      }
    } catch (error) {
      console.error('[MissingFieldsChatbot] Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{chatbot.title}</h2>
              <p className="text-sm text-primary-100">{chatbot.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-3 bg-white border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                  <p className="text-sm text-gray-600">{chatbot.thinking}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={chatbot.inputPlaceholder}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{chatbot.sendButton}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
