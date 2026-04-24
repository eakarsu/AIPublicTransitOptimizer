import React from 'react';
import ReactMarkdown from 'react-markdown';

function AIResult({ result, loading, error, onClose }) {
  if (loading) {
    return (
      <div className="ai-result-container">
        <div className="ai-result-header">
          <h3>AI Analysis in Progress</h3>
        </div>
        <div className="ai-loading">
          <div className="spinner"></div>
          <span>Analyzing data with AI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-error">
        <strong>AI Analysis Error:</strong> {error}
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="ai-result-container">
      <div className="ai-result-header">
        <h3>AI Analysis Results</h3>
        {onClose && (
          <button className="modal-close" onClick={onClose}>&times;</button>
        )}
      </div>
      <div className="ai-result-body">
        {result.success ? (
          <ReactMarkdown>{result.content}</ReactMarkdown>
        ) : (
          <div className="ai-error">{result.error || 'Analysis failed'}</div>
        )}
      </div>
      {result.success && result.usage && (
        <div className="ai-result-meta">
          <span>Model: {result.model || 'N/A'}</span>
          <span>Tokens: {result.usage.total_tokens || 'N/A'}</span>
        </div>
      )}
    </div>
  );
}

export default AIResult;
