import { useState, useEffect } from 'react';
import './AuditDialog.css';

function AuditDialog({ isOpen, onClose, analyzing, auditType }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    const stepsByProfile = {
        blind: [
            'Analyzing heading structure...',
            'Checking ARIA labels...',
            'Evaluating landmarks...',
            'Detecting skip links...',
            'Generating report...'
        ],
        colorblind: [
            'Scanning page structure...',
            'Analyzing color contrast...',
            'Checking color-only elements...',
            'Evaluating alt text...',
            'Reviewing form labels...',
            'Generating report...'
        ],
        lowvision: [
            'Checking text sizes...',
            'Analyzing contrast...',
            'Evaluating zoom support...',
            'Reviewing focus indicators...',
            'Generating report...'
        ],
        photosensitive: [
            'Detecting animations...',
            'Checking for flashing content...',
            'Evaluating auto-play media...',
            'Analyzing motion effects...',
            'Generating report...'
        ],
        deaf: [
            'Checking video captions...',
            'Analyzing audio content...',
            'Evaluating visual alerts...',
            'Reviewing transcripts...',
            'Generating report...'
        ],
        motor: [
            'Scanning keyboard accessibility...',
            'Checking click target sizes...',
            'Evaluating focus visibility...',
            'Detecting drag-and-drop...',
            'Generating report...'
        ],
        keyboard: [
            'Checking tab order...',
            'Detecting focus traps...',
            'Evaluating skip links...',
            'Analyzing keyboard shortcuts...',
            'Generating report...'
        ],
        dyslexia: [
            'Checking line spacing...',
            'Analyzing font sizes...',
            'Evaluating text alignment...',
            'Reviewing typography...',
            'Generating report...'
        ],
        cognitive: [
            'Analyzing layout structure...',
            'Checking navigation complexity...',
            'Evaluating content clarity...',
            'Detecting distractions...',
            'Generating report...'
        ],
        adhd: [
            'Scanning page structure...',
            'Detecting auto-play media...',
            'Analyzing animations...',
            'Checking navigation complexity...',
            'Evaluating content structure...',
            'Generating report...'
        ],
        autism: [
            'Checking consistency...',
            'Analyzing predictability...',
            'Evaluating sensory load...',
            'Reviewing clear labels...',
            'Generating report...'
        ],
        anxiety: [
            'Detecting time pressure...',
            'Analyzing form complexity...',
            'Checking CTA clarity...',
            'Evaluating error recovery...',
            'Generating report...'
        ]
    };

    const steps = stepsByProfile[auditType] || stepsByProfile.colorblind;

    useEffect(() => {
        if (isOpen && analyzing) {
            setCurrentStep(0);
            setProgress(0);

            const stepInterval = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev < steps.length - 1) {
                        return prev + 1;
                    }
                    return prev;
                });
            }, 400);

            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 95) {
                        return prev + Math.random() * 8;
                    }
                    return prev;
                });
            }, 200);

            return () => {
                clearInterval(stepInterval);
                clearInterval(progressInterval);
            };
        }
    }, [isOpen, analyzing, steps.length]);

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            setProgress(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getAuditTitle = () => {
        const titles = {
            blind: 'Analyzing Screen Reader Support',
            colorblind: 'Analyzing Color Accessibility',
            lowvision: 'Analyzing Visual Clarity',
            photosensitive: 'Analyzing Photosensitivity Safety',
            deaf: 'Analyzing Hearing Accessibility',
            motor: 'Analyzing Motor Accessibility',
            keyboard: 'Analyzing Keyboard Navigation',
            dyslexia: 'Analyzing Reading Accessibility',
            cognitive: 'Analyzing Cognitive Accessibility',
            adhd: 'Analyzing Focus & Attention',
            autism: 'Analyzing Sensory Accessibility',
            anxiety: 'Analyzing Stress-Free Design'
        };
        return titles[auditType] || 'Analyzing Accessibility...';
    };

    // Calculate the stroke dasharray for the progress ring
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

    return (
        <div className="dialog-overlay">
            <div className="dialog-container">
                <div className="dialog-header">
                    <h2>{getAuditTitle()}</h2>
                </div>

                <div className="dialog-content">
                    <div className="analysis-loading">
                        {/* Progress Ring */}
                        <div className="progress-ring-container">
                            <svg className="progress-ring" viewBox="0 0 120 120">
                                {/* Background circle */}
                                <circle
                                    className="progress-ring-bg"
                                    cx="60"
                                    cy="60"
                                    r={radius}
                                    fill="none"
                                    strokeWidth="6"
                                />
                                {/* Progress circle */}
                                <circle
                                    className="progress-ring-fill"
                                    cx="60"
                                    cy="60"
                                    r={radius}
                                    fill="none"
                                    strokeWidth="6"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="progress-ring-inner">
                                <span className="progress-ring-value">
                                    {Math.round(Math.min(progress, 100))}
                                </span>
                            </div>
                        </div>

                        {/* Current Step */}
                        <div className="steps-container">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`step-item ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
                                >
                                    <span className="step-icon">
                                        {index < currentStep ? '✓' : index === currentStep ? '●' : '○'}
                                    </span>
                                    <span className="step-text">{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuditDialog;
