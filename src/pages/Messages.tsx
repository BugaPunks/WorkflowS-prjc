import { useState, useEffect, useRef } from "react";
import { useSession } from "@/hooks/useSession";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface ChatParticipant {
    userId: string;
    user: User;
}

interface Chat {
    id: string;
    type: string;
    participants: ChatParticipant[];
    messages: Message[];
}

interface Message {
    id: string;
    content: string;
    userId: string;
    createdAt: string;
    user: User;
}

export default function Messages() {
    const { session: user } = useSession();
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetch(`/api/chat/user/${user.id}/all`)
                .then(res => res.json())
                .then(data => setChats(data.data || []));
        }
    }, [user]);

    useEffect(() => {
        if (selectedChat) {
            const loadMsgs = () => {
                fetch(`/api/chat/conversation/${selectedChat.id}/messages`)
                    .then(res => res.json())
                    .then(data => setMessages(data.data || []));
            };
            loadMsgs();
            const interval = setInterval(loadMsgs, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        // biome-ignore lint/correctness/useExhaustiveDependencies: Need to scroll when messages change
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedChat || !user) return;

        try {
            await fetch(`/api/chat/conversation/${selectedChat.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, content: input })
            });
            setInput("");
            // Immediate fetch
            const res = await fetch(`/api/chat/conversation/${selectedChat.id}/messages`);
            const data = await res.json();
            setMessages(data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadUsers = async () => {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data.data || []);
    };

    const startDM = async (targetUserId: string) => {
        if (!user) return;
        try {
            const res = await fetch("/api/chat/direct", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, targetUserId })
            });
            const data = await res.json();
            const chat = data.data;

            // Refresh list
            const listRes = await fetch(`/api/chat/user/${user.id}/all`);
            const listData = await listRes.json();
            setChats(listData.data || []);

            // Select new chat
            const fullChat = (listData.data || []).find((c: Chat) => c.id === chat.id);
            if (fullChat) setSelectedChat(fullChat);

            setShowNewChatModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const getChatName = (chat: Chat) => {
        if (chat.type === "PROJECT") return "Chat de Proyecto"; // Ideally fetch project name
        // For DM, find the other participant
        const other = chat.participants.find(p => p.userId !== user?.id);
        return other ? other.user.name : "Chat Personal";
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-lg text-gray-800">Mensajes</h2>
                    <button
                        type="button"
                        onClick={() => { setShowNewChatModal(true); loadUsers(); }}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                        title="Nuevo Mensaje"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <title>Nuevo Mensaje</title>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => (
                        <button
                            type="button"
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedChat?.id === chat.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}
                        >
                            <div className="font-medium text-gray-900">{getChatName(chat)}</div>
                            <div className="text-sm text-gray-500 truncate">
                                {chat.messages[0]?.content || "Sin mensajes"}
                            </div>
                        </button>
                    ))}
                    {chats.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No tienes conversaciones.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedChat ? (
                    <>
                        <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
                            <h3 className="font-bold text-gray-800">{getChatName(selectedChat)}</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map(msg => {
                                const isMe = msg.userId === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"}`}>
                                            {!isMe && <div className="text-xs font-bold mb-1 opacity-70">{msg.user.name}</div>}
                                            <p className="text-sm">{msg.content}</p>
                                            <div className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <title>Enviar</title>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
                        <svg className="w-16 h-16 mb-4 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                            <title>No seleccionado</title>
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                        <p>Selecciona una conversación para empezar</p>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Nuevo Mensaje</h3>
                            <button type="button" onClick={() => setShowNewChatModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {users.filter(u => u.id !== user?.id).map(u => (
                                <button
                                    type="button"
                                    key={u.id}
                                    onClick={() => startDM(u.id)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                >
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                        {u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{u.name}</div>
                                        <div className="text-sm text-gray-500">{u.email}</div>
                                        <div className="text-xs text-gray-400 uppercase mt-0.5">{u.role || "Usuario"}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
