import { useState, useEffect } from 'react';
import './AuditDialog.css';

function AuditDialog({ isOpen, onClose, analyzing }) {
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [mode, setMode] = useState('navigation');
    const [device, setDevice] = useState('desktop');
    const [categories, setCategories] = useState({
        performance: true,
        accessibility: true,
        bestPractices: true,
        seo: true
    });

    useEffect(() => {
        if (analyzing) {
            setAnalysisComplete(false);
            const timer = setTimeout(() => {
                setAnalysisComplete(true);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [analyzing]);

    if (!isOpen) return null;

    const toggleCategory = (category) => {
        setCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog-container">
                {/* Header */}
                <div className="dialog-header">
                    <button className="analyze-button" onClick={onClose}>
                        Analyze page load
                    </button>
                </div>

                {/* Options Grid */}
                <div className="options-grid">
                    {/* Mode Section */}
                    <div className="option-section">
                        <div className="section-header">
                            <span className="section-title">Mode</span>
                            <a href="#" className="learn-more">Learn more</a>
                        </div>
                        <div className="radio-group">
                            <label className="radio-item">
                                <input
                                    type="radio"
                                    name="mode"
                                    checked={mode === 'navigation'}
                                    onChange={() => setMode('navigation')}
                                />
                                <span className="radio-custom"></span>
                                <span className="radio-label">Navigation (Default)</span>
                            </label>
                            <label className="radio-item">
                                <input
                                    type="radio"
                                    name="mode"
                                    checked={mode === 'timespan'}
                                    onChange={() => setMode('timespan')}
                                />
                                <span className="radio-custom"></span>
                                <span className="radio-label">Timespan</span>
                            </label>
                            <label className="radio-item">
                                <input
                                    type="radio"
                                    name="mode"
                                    checked={mode === 'snapshot'}
                                    onChange={() => setMode('snapshot')}
                                />
                                <span className="radio-custom"></span>
                                <span className="radio-label">Snapshot</span>
                            </label>
                        </div>
                    </div>

                    {/* Device Section */}
                    <div className="option-section">
                        <div className="section-header">
                            <span className="section-title">Device</span>
                        </div>
                        <div className="radio-group">
                            <label className="radio-item">
                                <input
                                    type="radio"
                                    name="device"
                                    checked={device === 'mobile'}
                                    onChange={() => setDevice('mobile')}
                                />
                                <span className="radio-custom"></span>
                                <span className="radio-label">Mobile</span>
                            </label>
                            <label className="radio-item">
                                <input
                                    type="radio"
                                    name="device"
                                    checked={device === 'desktop'}
                                    onChange={() => setDevice('desktop')}
                                />
                                <span className="radio-custom"></span>
                                <span className="radio-label">Desktop</span>
                            </label>
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div className="option-section">
                        <div className="section-header">
                            <span className="section-title">Categories</span>
                        </div>
                        <div className="checkbox-group">
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={categories.performance}
                                    onChange={() => toggleCategory('performance')}
                                />
                                <span className="checkbox-custom"></span>
                                <span className="checkbox-label">Performance</span>
                            </label>
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={categories.accessibility}
                                    onChange={() => toggleCategory('accessibility')}
                                />
                                <span className="checkbox-custom"></span>
                                <span className="checkbox-label">Accessibility</span>
                            </label>
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={categories.bestPractices}
                                    onChange={() => toggleCategory('bestPractices')}
                                />
                                <span className="checkbox-custom"></span>
                                <span className="checkbox-label">Best practices</span>
                            </label>
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={categories.seo}
                                    onChange={() => toggleCategory('seo')}
                                />
                                <span className="checkbox-custom"></span>
                                <span className="checkbox-label">SEO</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Warning Message */}
                <div className="warning-message">
                    <span className="warning-icon">⚠</span>
                    <span className="warning-text">
                        There may be stored data affecting loading performance in this location: IndexedDB.
                        Audit this page in an incognito window to prevent those resources from affecting your scores.
                    </span>
                </div>

                {/* Content Area for Analysis Results */}
                {analysisComplete && (
                    <div className="analysis-results">
                        <div className="results-header">
                            <h2>Cerebral Achromatopsia: Color Vision Loss Analysis</h2>
                        </div>
                        <div className="results-content">
                            <div className="result-section">
                                <h3>👁️ Color Perception</h3>
                                <p>Cerebral achromatopsia is an acquired form of color blindness caused by damage to the brain's visual cortex. Individuals typically cannot perceive any colors – describing their world as "shades of gray".</p>
                            </div>
                            <div className="result-section">
                                <h3>🔬 Diagnosis Methods</h3>
                                <p>Behavioral tests include Farnsworth–Munsell 100-Hue Test and Ishihara Color Plate Test. Only 29% of patients pass Ishihara tests.</p>
                            </div>
                            <div className="result-section">
                                <h3>📈 Key Findings</h3>
                                <p>22% of stroke patients with occipital damage showed color discrimination problems. 44% with bilateral lesions had measurable color vision loss.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AuditDialog;
