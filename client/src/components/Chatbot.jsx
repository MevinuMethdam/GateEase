import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your GateEase Assistant ✨ How can I help you today?", sender: "bot" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // චැට් එක අගට ඉබේම Scroll වෙන්න
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { text: userMsg, sender: "user" }]);
        setInput('');
        setIsLoading(true);

        try {
            // Backend එකට මැසේජ් එක යවනවා
            const response = await axios.post('http://localhost:5000/api/chat', { message: userMsg });

            setMessages(prev => [...prev, { text: response.data.reply, sender: "bot" }]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now. Please try again later. 🔌", sender: "bot" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Chat Box එක */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

                    {/* Header */}
                    <div className="bg-[#111111] border-b border-white/5 p-4 flex justify-between items-center shadow-md relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#C0DE1B]/10 blur-[30px] rounded-full pointer-events-none"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 bg-[#C0DE1B]/10 border border-[#C0DE1B]/20 rounded-xl flex items-center justify-center">
                                <Bot className="w-5 h-5 text-[#C0DE1B]" />
                            </div>
                            <div>
                                <h3 className="text-white font-extrabold text-[16px] flex items-center gap-1.5">GateEase AI <Sparkles className="w-3.5 h-3.5 text-[#C0DE1B]"/></h3>
                                <p className="text-[#C0DE1B] text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-[#C0DE1B] rounded-full animate-pulse"></span> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all relative z-10">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-[#C0DE1B] text-black rounded-br-sm font-semibold' : 'bg-[#111111] border border-white/5 text-[#EAEAEA] rounded-bl-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#111111] border border-white/5 text-[#A0A0A0] p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#C0DE1B]/50 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-[#C0DE1B]/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                                    <span className="w-2 h-2 bg-[#C0DE1B]/50 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#111111] border-t border-white/5">
                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                disabled={isLoading}
                                className="w-full bg-[#050505] text-white pl-5 pr-12 py-3.5 rounded-2xl border border-white/10 focus:border-[#C0DE1B]/50 focus:outline-none text-sm transition-all shadow-inner disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 w-10 h-10 flex items-center justify-center bg-[#C0DE1B] text-black rounded-xl hover:bg-[#9EBA11] transition-colors disabled:opacity-50 disabled:hover:bg-[#C0DE1B]"
                            >
                                <Send className="w-4 h-4 ml-1" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Button (Chat අයිකන් එක) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(192,222,24,0.3)] hover:shadow-[0_15px_40px_rgba(192,222,24,0.5)] transition-all duration-300 hover:-translate-y-1 ${isOpen ? 'bg-[#111111] border border-[#C0DE1B]/30 text-[#C0DE1B]' : 'bg-gradient-to-tr from-[#C0DE1B] to-[#9EBA11] text-black'}`}
            >
                {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
            </button>
        </div>
    );
};

export default Chatbot;