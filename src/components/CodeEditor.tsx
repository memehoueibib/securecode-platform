import React, { useState, useRef, useEffect } from 'react';
import { Play, Upload, Download, Copy, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onScan: () => void;
  isScanning: boolean;
  fileName: string;
  onFileNameChange: (name: string) => void;
}

function CodeEditor({ value, onChange, onScan, isScanning, fileName, onFileNameChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineNumbers(Array.from({ length: Math.max(lines, 20) }, (_, i) => i + 1));
  }, [value]);

  // Synchroniser le scroll entre les numéros de ligne et le textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }

    // Ctrl+Enter pour analyser
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isScanning && value.trim()) {
        onScan();
      }
    }

    // F11 pour plein écran
    if (e.key === 'F11') {
      e.preventDefault();
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onChange(content);
        onFileNameChange(file.name);
      };
      reader.readAsText(file);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([value], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'code.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
  };

  const clearCode = () => {
    onChange('');
    onFileNameChange('');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const editorClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-white dark:bg-gray-800"
    : "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700";

  return (
    <div className={editorClasses}>
      {/* En-tête de l'éditeur */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Éditeur de Code
          </h2>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFullscreen}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isFullscreen ? "Quitter le plein écran (F11)" : "Plein écran (F11)"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          
          <label className="cursor-pointer text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Upload className="h-4 w-4" />
            <input
              type="file"
              accept=".js,.jsx,.ts,.tsx,.py,.java,.php,.c,.cpp,.cs"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          
          <button
            onClick={downloadCode}
            disabled={!value.trim()}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Télécharger le code"
          >
            <Download className="h-4 w-4" />
          </button>
          
          <button
            onClick={copyToClipboard}
            disabled={!value.trim()}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Copier le code"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          <button
            onClick={clearCode}
            disabled={!value.trim()}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Effacer le code"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Champ nom de fichier */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={fileName}
          onChange={(e) => onFileNameChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="nom-du-fichier.js"
        />
      </div>
      
      {/* Zone d'édition avec numéros de ligne */}
      <div className={`relative flex ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-96'}`}>
        {/* Numéros de ligne */}
        <div 
          ref={lineNumbersRef}
          className="bg-gray-50 dark:bg-gray-900 px-3 py-4 border-r border-gray-200 dark:border-gray-700 select-none overflow-hidden"
          style={{ minWidth: '60px' }}
        >
          {lineNumbers.map((num) => (
            <div
              key={num}
              className="text-xs text-gray-500 dark:text-gray-400 leading-6 text-right font-mono"
              style={{ height: '24px' }}
            >
              {num}
            </div>
          ))}
        </div>
        
        {/* Zone de texte */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="w-full h-full p-4 text-sm font-mono bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none leading-6 overflow-auto"
            placeholder="// Collez votre code JavaScript ici...
// Exemple:
function handleUserInput() {
  const userInput = req.body.content;
  document.getElementById('output').innerHTML = userInput;
}

// Raccourcis clavier:
// Ctrl+Enter : Analyser le code
// F11 : Plein écran
// Tab : Indentation"
            spellCheck={false}
            style={{ 
              lineHeight: '24px',
              tabSize: 2
            }}
          />
        </div>
      </div>
      
      {/* Pied de l'éditeur */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Lignes: {value.split('\n').length}</span>
          <span>Caractères: {value.length}</span>
          <span>Mots: {value.trim() ? value.trim().split(/\s+/).length : 0}</span>
          <span className="hidden sm:inline">JavaScript</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            Ctrl+Enter pour analyser
          </div>
          <button
            onClick={onScan}
            disabled={!value.trim() || isScanning}
            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isScanning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyse...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Analyser
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;