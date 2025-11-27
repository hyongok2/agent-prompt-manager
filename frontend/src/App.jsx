import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FileText, History, Save, Copy, ChevronDown, ChevronRight, Folder, FileCode, RefreshCw } from 'lucide-react';
import './App.css';

const API_URL = window.APP_CONFIG?.API_URL !== '__API_URL__'
  ? window.APP_CONFIG?.API_URL
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

function App() {
  const [view, setView] = useState('prompts'); // 'prompts' or 'history'
  const [prompts, setPrompts] = useState([]);
  const [historyTree, setHistoryTree] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [content, setContent] = useState('');
  const [historyContent, setHistoryContent] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sidebarRef = useRef(null);

  useEffect(() => {
    fetchPrompts();
    fetchHistoryTree();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/prompts`);
      setPrompts(response.data);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      showMessage('Failed to load prompts', 'error');
    }
  };

  const fetchHistoryTree = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/prompts/history/tree`);
      setHistoryTree(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const loadPrompt = async (filename) => {
    try {
      const response = await axios.get(`${API_URL}/api/prompts/${filename}`);
      setSelectedPrompt(filename);
      setContent(response.data.content);
      setHistoryContent(null);
      setView('prompts');
    } catch (error) {
      console.error('Failed to load prompt:', error);
      showMessage('Failed to load prompt', 'error');
    }
  };

  const handleSaveClick = () => {
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    if (!selectedPrompt) return;

    setShowConfirm(false);
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/prompts/${selectedPrompt}`, { content });
      showMessage('Saved successfully!', 'success');
      fetchPrompts();
      fetchHistoryTree();
    } catch (error) {
      console.error('Failed to save prompt:', error);
      showMessage('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelSave = () => {
    setShowConfirm(false);
  };

  const loadHistoryFile = async (folder, filename) => {
    try {
      const response = await axios.get(`${API_URL}/api/prompts/history/${folder}/${filename}`);
      setHistoryContent({
        folder,
        filename,
        content: response.data.content
      });
      setSelectedPrompt(null);
    } catch (error) {
      console.error('Failed to load history file:', error);
      showMessage('Failed to load history file', 'error');
    }
  };

  const copyHistoryContent = () => {
    if (historyContent) {
      navigator.clipboard.writeText(historyContent.content);
      showMessage('Copied to clipboard!', 'success');
    }
  };

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchPrompts();
      await fetchHistoryTree();
      showMessage('새로고침 완료!', 'success');
    } catch (error) {
      showMessage('새로고침 실패', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <FileCode size={32} />
            <h1>Agent Prompt Manager</h1>
          </div>
          <button
            className="btn btn-secondary refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            새로고침
          </button>
        </div>
      </header>

      <div className="container">
        <aside className="sidebar" ref={sidebarRef} style={{ width: `${sidebarWidth}px` }}>
          <div className="tabs">
            <button
              className={`tab ${view === 'prompts' ? 'active' : ''}`}
              onClick={() => setView('prompts')}
            >
              <FileText size={18} />
              Prompts
            </button>
            <button
              className={`tab ${view === 'history' ? 'active' : ''}`}
              onClick={() => setView('history')}
            >
              <History size={18} />
              History
            </button>
          </div>

          <div className="sidebar-content">
            {view === 'prompts' ? (
              <div className="prompt-list">
                {prompts.map((prompt) => (
                  <button
                    key={prompt.filename}
                    className={`list-item ${selectedPrompt === prompt.filename ? 'active' : ''}`}
                    onClick={() => loadPrompt(prompt.filename)}
                  >
                    <FileText size={16} />
                    <span className="filename">{prompt.filename}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="history-tree">
                {historyTree.map((item) => (
                  <div key={item.folder} className="tree-folder">
                    <button
                      className="folder-header"
                      onClick={() => toggleFolder(item.folder)}
                    >
                      {expandedFolders[item.folder] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      <Folder size={16} />
                      <span>{item.folder}</span>
                    </button>
                    {expandedFolders[item.folder] && (
                      <div className="folder-files">
                        {item.files.map((file) => (
                          <button
                            key={file.filename}
                            className={`file-item ${
                              historyContent?.filename === file.filename ? 'active' : ''
                            }`}
                            onClick={() => loadHistoryFile(item.folder, file.filename)}
                          >
                            <FileText size={14} />
                            <span className="filename">{file.filename}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div
          className={`resize-handle ${isResizing ? 'resizing' : ''}`}
          onMouseDown={handleMouseDown}
        />

        <main className="main-content">
          {selectedPrompt || historyContent ? (
            <div className="editor-container">
              <div className="editor-header">
                <h2>{historyContent ? historyContent.filename : selectedPrompt}</h2>
                <div className="editor-actions">
                  {historyContent ? (
                    <button className="btn btn-secondary" onClick={copyHistoryContent}>
                      <Copy size={18} />
                      Copy
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveClick}
                      disabled={saving}
                    >
                      <Save size={18} />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
              </div>
              <textarea
                className="editor"
                value={historyContent ? historyContent.content : content}
                onChange={(e) => !historyContent && setContent(e.target.value)}
                readOnly={!!historyContent}
                placeholder="Enter your prompt content here..."
              />
            </div>
          ) : (
            <div className="empty-state">
              <FileCode size={64} strokeWidth={1} />
              <p>Select a prompt to edit or view history</p>
            </div>
          )}
        </main>
      </div>

      {message && (
        <div className={`toast toast-${message.type}`}>
          {message.text}
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={cancelSave}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>변경사항 저장</h3>
            <p>프롬프트를 저장하시겠습니까?</p>
            <p className="modal-info">저장 시 자동으로 이력이 생성됩니다.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={cancelSave}>
                취소
              </button>
              <button className="btn btn-primary" onClick={confirmSave}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
