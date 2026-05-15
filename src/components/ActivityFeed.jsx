import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, limit } from 'firebase/firestore';
import { Send, User, Shield, Activity, Trash2, Clock, Paperclip, FileText, Image as ImageIcon, X } from 'lucide-react';
import { uploadFile } from '../services/db';
import { useAuth } from '../contexts/AuthContext';

export default function ActivityFeed({ isAdmin, isDark = false }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = isAdmin 
        ? data 
        : data.filter(m => m.uid === currentUser?.uid || m.isPublic || m.targetUid === currentUser?.uid || m.type === 'system' || !m.type || m.type === 'chat');
      setMessages(filtered);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [isAdmin, currentUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !file) || !currentUser || isUploading) return;

    setIsUploading(true);
    try {
      let fileData = null;
      if (file) {
        const url = await uploadFile(file, 'activities');
        fileData = { url, name: file.name, type: file.type.startsWith('image/') ? 'image' : 'document' };
      }

      await addDoc(collection(db, 'activities'), {
        message: newMessage.trim(),
        file: fileData,
        uid: currentUser.uid,
        userName: currentUser.name || currentUser.email?.split('@')[0] || 'User',
        role: isAdmin ? 'Admin' : 'Employee',
        type: 'chat',
        isPublic: true,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) { console.error('Error sending message:', err); }
    setIsUploading(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, 'activities', confirmDelete));
      setConfirmDelete(null);
    } catch (err) { console.error(err); }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <Activity size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
          <h2 className={`font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Activity Feed</h2>
        </div>
        <div className={`flex items-center gap-2 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[350px] max-h-[450px] scrollbar-thin">
        {messages.length === 0 ? (
          <div className={`text-center py-10 text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            No activity yet. Start the conversation!
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.uid === currentUser?.uid;
            const isSystem = msg.type !== 'chat' && msg.type !== undefined;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2 group relative">
                  <div className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-2 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    <Activity size={12} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
                    {msg.message}
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => setConfirmDelete(msg.id)}
                      className={`absolute -right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full ${isDark ? 'text-slate-500 hover:text-rose-400' : 'text-slate-400 hover:text-rose-500'}`}
                      title="Purge System Log"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex gap-3 group ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'Admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                    {msg.role === 'Admin' ? <Shield size={14} /> : <User size={14} />}
                  </div>
                )}
                
                <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{msg.userName}</span>}
                  
                  <div className="flex items-center gap-2 relative group">
                    <div className={`p-3 rounded-2xl ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' 
                        : isDark ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      {msg.file && (
                        <div className="mb-2">
                          {msg.file.type === 'image' ? (
                            <img src={msg.file.url} alt="attachment" className="max-w-[200px] max-h-[200px] rounded-lg object-cover" />
                          ) : (
                            <a href={msg.file.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded-lg text-sm ${isMe ? 'bg-blue-700/50 hover:bg-blue-700' : isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-slate-50'}`}>
                              <FileText size={16} />
                              <span className="truncate max-w-[150px]">{msg.file.name}</span>
                            </a>
                          )}
                        </div>
                      )}
                      {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                    </div>

                    {(isAdmin || isMe) && (
                      <button 
                        onClick={() => setConfirmDelete(msg.id)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full ${isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'}`}
                        title="Remove Content"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <span className={`text-[9px] font-medium mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-4 border-t flex flex-col gap-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        {file && (
          <div className={`flex items-center justify-between p-2 rounded-lg text-sm ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
            <div className="flex items-center gap-2 overflow-hidden">
              {file.type.startsWith('image/') ? <ImageIcon size={14} className="shrink-0" /> : <FileText size={14} className="shrink-0" />}
              <span className="truncate max-w-[200px] text-xs font-medium">{file.name}</span>
            </div>
            <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-blue-400' : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600'}`}
          >
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
              isDark ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
          <button
            type="submit"
            disabled={(!newMessage.trim() && !file) || isUploading}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center"
          >
            {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>

      {/* Delete Confirmation Overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-6 rounded-2xl shadow-xl w-full max-w-[280px] text-center border animate-in zoom-in duration-200`}>
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-rose-500" />
            </div>
            <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Delete activity?</h3>
            <p className={`text-xs font-medium mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>This action cannot be undone and will remove the message from the feed.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
