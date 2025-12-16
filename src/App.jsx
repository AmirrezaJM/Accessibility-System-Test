import { useState } from 'react';
import './App.css';
import AuditDialog from './AuditDialog';

function App() {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const runAudit = () => {
    setShowDialog(true);
    setAnalyzing(true);
    setReport(null);

    setTimeout(() => {
      analyzeWebsite();
    }, 2000);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setAnalyzing(false);
  };

  const analyzeWebsite = () => {
    // Performance Analysis
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const perf = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        
        return {
          loadTime: perf ? Math.round(perf.loadEventEnd - perf.fetchStart) : 0,
          domContentLoaded: perf ? Math.round(perf.domContentLoadedEventEnd - perf.fetchStart) : 0,
          resourceCount: resources.length,
          totalSize: resources.reduce((acc, r) => acc + (r.transferSize || 0), 0),
          images: resources.filter(r => r.initiatorType === 'img').length,
          scripts: resources.filter(r => r.initiatorType === 'script').length,
          stylesheets: resources.filter(r => r.initiatorType === 'link' || r.initiatorType === 'css').length,
        };
      })()
    `, (performanceData, isException) => {
      if (isException) {
        console.error('Performance analysis error:', isException);
        performanceData = { loadTime: 0, resourceCount: 0, totalSize: 0 };
      }

      // Accessibility Analysis
      chrome.devtools.inspectedWindow.eval(`
        (function() {
          const images = document.querySelectorAll('img');
          const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '').length;
          
          const links = document.querySelectorAll('a');
          const linksWithoutText = Array.from(links).filter(a => !a.textContent.trim() && !a.getAttribute('aria-label')).length;
          
          const inputs = document.querySelectorAll('input, textarea, select');
          const inputsWithoutLabels = Array.from(inputs).filter(input => {
            const id = input.id;
            return !id || !document.querySelector(\`label[for="\${id}"]\`);
          }).length;
          
          const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          const buttons = document.querySelectorAll('button');
          
          return {
            imagesWithoutAlt,
            totalImages: images.length,
            linksWithoutText,
            totalLinks: links.length,
            inputsWithoutLabels,
            totalInputs: inputs.length,
            hasH1: document.querySelector('h1') !== null,
            headingCount: headings.length,
            buttonCount: buttons.length,
            hasLangAttr: document.documentElement.hasAttribute('lang'),
            hasTitle: !!document.title,
          };
        })()
      `, (accessibilityData, isException) => {
        if (isException) {
          console.error('Accessibility analysis error:', isException);
          accessibilityData = {};
        }
      });
    });
  };


  return (
    <div className="auditor-container">
      <header className="auditor-header">
        <div className="header-content">
          <h1>ASIA</h1>
          <p className="subtitle">Automation System for Website</p>
        </div>
        {/* 
        <div className="action-section">
          <button
            className="analyze-btn"
            onClick={runAudit}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                ▶ Run Audit
              </>
            )}
          </button>
        </div> */}
      </header>

      {report && (
        <div className="report-container">
          <div className="report-header">
            <h2>Audit Report</h2>
            <span className="timestamp">{report.timestamp}</span>
          </div>

          {/* Score Cards */}
          <div className="scores-grid">

            <div className="score-card">
              <div className="score-circle" style={{ borderColor: getScoreColor(report.accessibility.score) }}>
                <div className="score-number" style={{ color: getScoreColor(report.accessibility.score) }}>
                  {report.accessibility.score}
                </div>
              </div>
              <h3>Accessibility</h3>
              <span className="score-label" style={{ color: getScoreColor(report.accessibility.score) }}>
                {getScoreLabel(report.accessibility.score)}
              </span>
            </div>
          </div>
        </div>
      )}

      {!report && !analyzing && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>Ready to Audit</h2>
          <p>Click "Run Audit" to analyze the current page</p>
          <div className="features-list">
            <div className="feature">✓ Accessibility Checks</div>
          </div>
        </div>
      )}

      <AuditDialog
        isOpen={showDialog}
        onClose={closeDialog}
        analyzing={analyzing}
      />
    </div>
  );
}

export default App;
