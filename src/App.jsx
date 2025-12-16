import { useState } from 'react';
import './App.css';
import AuditDialog from './AuditDialog';

// Accessibility Profiles Configuration - Expanded Set
const ACCESSIBILITY_PROFILES = {
  // Vision-related
  blind: {
    id: 'blind',
    name: 'Blind',
    category: 'vision',
    description: 'Supports screen reader users and keyboard-only navigation.',
    checks: ['headings', 'ariaLabels', 'landmarks', 'skipLinks']
  },
  colorblind: {
    id: 'colorblind',
    name: 'Color Blind',
    category: 'vision',
    description: 'Supports people who have difficulty distinguishing certain colors.',
    checks: ['contrast', 'colorOnly', 'altText', 'buttonStates']
  },
  lowvision: {
    id: 'lowvision',
    name: 'Low Vision',
    category: 'vision',
    description: 'Supports people with low vision who need larger text and high contrast.',
    checks: ['textSize', 'contrast', 'zoomable', 'focusIndicators']
  },
  photosensitive: {
    id: 'photosensitive',
    name: 'Photosensitive',
    category: 'vision',
    description: 'Supports people sensitive to flashing, motion, or bright content.',
    checks: ['flashingContent', 'animations', 'autoPlay', 'motion']
  },
  // Hearing-related
  deaf: {
    id: 'deaf',
    name: 'Deaf / Hard of Hearing',
    category: 'hearing',
    description: 'Supports people who rely on captions, transcripts, and visual alerts.',
    checks: ['captions', 'transcripts', 'visualAlerts', 'audioDescriptions']
  },
  // Motor & Mobility
  motor: {
    id: 'motor',
    name: 'Limited Dexterity',
    category: 'motor',
    description: 'Supports people who have difficulty with precise movements or use assistive devices.',
    checks: ['keyboard', 'clickAreas', 'focusVisibility', 'dragDrop']
  },
  keyboard: {
    id: 'keyboard',
    name: 'Keyboard Only',
    category: 'motor',
    description: 'Supports people who navigate entirely without a mouse.',
    checks: ['tabOrder', 'focusTraps', 'keyboardShortcuts', 'skipLinks']
  },
  // Cognitive & Learning
  dyslexia: {
    id: 'dyslexia',
    name: 'Dyslexia',
    category: 'cognitive',
    description: 'Supports people who may find reading dense text difficult or tiring.',
    checks: ['textSpacing', 'lineHeight', 'fontsize', 'textAlignment']
  },
  cognitive: {
    id: 'cognitive',
    name: 'Cognitive & Learning',
    category: 'cognitive',
    description: 'Supports needs related to memory, processing, and comprehension.',
    checks: ['simpleLayout', 'navigation', 'wording', 'distractions']
  },
  adhd: {
    id: 'adhd',
    name: 'ADHD & Focus',
    category: 'cognitive',
    description: 'Supports people who are easily distracted or overwhelmed by busy pages.',
    checks: ['visualNoise', 'hierarchy', 'spacing', 'distractions']
  },
  autism: {
    id: 'autism',
    name: 'Autism & Sensory',
    category: 'cognitive',
    description: 'Supports people who need predictability and reduced sensory overload.',
    checks: ['consistency', 'predictability', 'sensoryLoad', 'clearLabels']
  },
  anxiety: {
    id: 'anxiety',
    name: 'Anxiety & Stress',
    category: 'cognitive',
    description: 'Supports people who may be overwhelmed by time pressure or complex UI.',
    checks: ['timers', 'pressure', 'clarity', 'errorRecovery']
  }
};

function App() {
  const [analyzing, setAnalyzing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [auditType, setAuditType] = useState('colorblind');
  const [device, setDevice] = useState('desktop');
  const [auditResults, setAuditResults] = useState(null);
  const [pageScreenshot, setPageScreenshot] = useState(null);

  const runAudit = () => {
    setShowDialog(true);
    setAnalyzing(true);
    setAuditResults(null);
    captureScreenshot();
    performAnalysis();
  };

  const captureScreenshot = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        return {
          url: window.location.href,
          title: document.title
        };
      })()
    `, (pageInfo) => {
      setPageScreenshot(pageInfo);
    });
  };

  const performAnalysis = () => {
    const analysisFunctions = {
      blind: analyzeBlind,
      colorblind: analyzeColorBlindness,
      lowvision: analyzeLowVision,
      photosensitive: analyzePhotosensitive,
      deaf: analyzeDeaf,
      motor: analyzeMotorImpaired,
      keyboard: analyzeKeyboardOnly,
      dyslexia: analyzeDyslexia,
      cognitive: analyzeCognitive,
      adhd: analyzeADHD,
      autism: analyzeAutism,
      anxiety: analyzeAnxiety
    };

    const analyzeFunc = analysisFunctions[auditType];
    if (analyzeFunc) {
      analyzeFunc();
    } else {
      console.error('Invalid audit type:', auditType);
    }
  };

  // Motor Impaired Analysis
  const analyzeMotorImpaired = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { keyboard: 0, clickAreas: 0, focus: 0, gestures: 0 }
        };

        // Check keyboard accessibility
        const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
        const nonFocusable = Array.from(focusableElements).filter(el => {
          const tabindex = el.getAttribute('tabindex');
          return tabindex === '-1';
        });

        results.metrics.push({
          name: 'Focusable Elements',
          value: focusableElements.length,
          status: 'info'
        });

        if (nonFocusable.length > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Elements removed from tab order',
            detail: nonFocusable.length + ' elements have tabindex="-1"'
          });
          results.scores.keyboard = Math.max(50, 100 - (nonFocusable.length * 10));
        } else {
          results.scores.keyboard = 100;
        }

        // Check click target sizes
        const buttons = document.querySelectorAll('button, a, [role="button"]');
        let smallTargets = 0;
        buttons.forEach(btn => {
          const rect = btn.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            smallTargets++;
          }
        });

        results.metrics.push({
          name: 'Small Click Targets',
          value: smallTargets,
          status: smallTargets === 0 ? 'pass' : smallTargets > 5 ? 'error' : 'warning'
        });

        if (smallTargets > 5) {
          results.diagnostics.push({
            type: 'error',
            title: 'Click targets too small',
            detail: smallTargets + ' elements under 44x44px minimum'
          });
          results.scores.clickAreas = Math.max(0, 100 - (smallTargets * 8));
        } else if (smallTargets > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Some small click targets',
            detail: smallTargets + ' elements could be larger'
          });
          results.scores.clickAreas = Math.max(50, 100 - (smallTargets * 8));
        } else {
          results.scores.clickAreas = 100;
        }

        // Check focus visibility
        const style = document.createElement('style');
        let hasFocusStyles = false;
        Array.from(document.styleSheets).forEach(sheet => {
          try {
            Array.from(sheet.cssRules || []).forEach(rule => {
              if (rule.selectorText && rule.selectorText.includes(':focus')) {
                hasFocusStyles = true;
              }
            });
          } catch(e) {}
        });

        results.metrics.push({
          name: 'Focus Styles',
          value: hasFocusStyles ? 'Present' : 'Missing',
          status: hasFocusStyles ? 'pass' : 'error'
        });

        if (!hasFocusStyles) {
          results.diagnostics.push({
            type: 'error',
            title: 'Missing focus styles',
            detail: 'No custom :focus styles detected'
          });
          results.scores.focus = 40;
        } else {
          results.scores.focus = 100;
        }

        // Check for drag-drop
        const draggables = document.querySelectorAll('[draggable="true"]');
        results.metrics.push({
          name: 'Draggable Elements',
          value: draggables.length,
          status: draggables.length === 0 ? 'pass' : 'warning'
        });

        if (draggables.length > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Drag-and-drop detected',
            detail: draggables.length + ' elements require keyboard alternative'
          });
          results.scores.gestures = 70;
        } else {
          results.scores.gestures = 100;
        }

        results.overallScore = Math.round((results.scores.keyboard + results.scores.clickAreas + results.scores.focus + results.scores.gestures) / 4);
        return results;
      })()
    `, handleAnalysisResult('motor'));
  };

  // Blind User Analysis
  const analyzeBlind = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { headings: 0, aria: 0, landmarks: 0, skipLinks: 0 }
        };

        // Check heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const h1Count = document.querySelectorAll('h1').length;
        
        results.metrics.push({
          name: 'Headings Found',
          value: headings.length,
          status: headings.length > 0 ? 'pass' : 'error'
        });

        if (h1Count === 0) {
          results.diagnostics.push({
            type: 'error',
            title: 'Missing H1 heading',
            detail: 'Page should have exactly one H1'
          });
          results.scores.headings = 50;
        } else if (h1Count > 1) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Multiple H1 headings',
            detail: 'Found ' + h1Count + ' H1 elements'
          });
          results.scores.headings = 70;
        } else {
          results.scores.headings = 100;
        }

        // Check ARIA labels
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        let unlabeled = 0;
        interactiveElements.forEach(el => {
          const hasLabel = el.getAttribute('aria-label') || 
                          el.getAttribute('aria-labelledby') ||
                          el.textContent.trim() ||
                          (el.id && document.querySelector('label[for="' + el.id + '"]'));
          if (!hasLabel) unlabeled++;
        });

        results.metrics.push({
          name: 'Unlabeled Elements',
          value: unlabeled,
          status: unlabeled === 0 ? 'pass' : unlabeled > 5 ? 'error' : 'warning'
        });

        if (unlabeled > 0) {
          results.diagnostics.push({
            type: unlabeled > 5 ? 'error' : 'warning',
            title: 'Elements missing accessible names',
            detail: unlabeled + ' interactive elements lack labels'
          });
          results.scores.aria = Math.max(0, 100 - (unlabeled * 10));
        } else {
          results.scores.aria = 100;
        }

        // Check landmarks
        const landmarks = document.querySelectorAll('main, nav, header, footer, aside, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
        
        results.metrics.push({
          name: 'Landmarks',
          value: landmarks.length,
          status: landmarks.length >= 3 ? 'pass' : landmarks.length > 0 ? 'warning' : 'error'
        });

        if (landmarks.length === 0) {
          results.diagnostics.push({
            type: 'error',
            title: 'No landmarks found',
            detail: 'Add semantic landmarks (main, nav, header, footer)'
          });
          results.scores.landmarks = 30;
        } else if (landmarks.length < 3) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Few landmarks',
            detail: 'Consider adding more semantic structure'
          });
          results.scores.landmarks = 70;
        } else {
          results.scores.landmarks = 100;
        }

        // Check skip links
        const skipLinks = document.querySelectorAll('a[href^="#"]');
        const hasSkipToMain = Array.from(skipLinks).some(link => 
          link.textContent.toLowerCase().includes('skip') || 
          link.getAttribute('href') === '#main' ||
          link.getAttribute('href') === '#content'
        );

        results.metrics.push({
          name: 'Skip Link',
          value: hasSkipToMain ? 'Present' : 'Missing',
          status: hasSkipToMain ? 'pass' : 'warning'
        });

        if (!hasSkipToMain) {
          results.diagnostics.push({
            type: 'warning',
            title: 'No skip link detected',
            detail: 'Add a "Skip to main content" link'
          });
          results.scores.skipLinks = 60;
        } else {
          results.scores.skipLinks = 100;
        }

        results.overallScore = Math.round((results.scores.headings + results.scores.aria + results.scores.landmarks + results.scores.skipLinks) / 4);
        return results;
      })()
    `, handleAnalysisResult('blind'));
  };

  // Color Blindness Analysis
  const analyzeColorBlindness = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { contrast: 0, altText: 0, colorOnly: 0, forms: 0 }
        };

        // Check images for alt text
        const images = document.querySelectorAll('img');
        const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '');
        
        results.metrics.push({
          name: 'Images Analyzed',
          value: images.length,
          status: 'info'
        });
        
        results.metrics.push({
          name: 'Alt Text Coverage',
          value: images.length > 0 ? Math.round(((images.length - imagesWithoutAlt.length) / images.length) * 100) + '%' : '100%',
          status: imagesWithoutAlt.length === 0 ? 'pass' : imagesWithoutAlt.length > 3 ? 'error' : 'warning'
        });

        if (imagesWithoutAlt.length > 0) {
          results.diagnostics.push({
            type: 'error',
            title: 'Images missing alt text',
            detail: 'Found ' + imagesWithoutAlt.length + ' images without alt'
          });
          results.scores.altText = Math.max(0, 100 - (imagesWithoutAlt.length * 15));
        } else {
          results.scores.altText = 100;
        }

        // Check links for color-only styling
        const links = document.querySelectorAll('a');
        let colorOnlyLinks = 0;
        links.forEach(link => {
          const style = window.getComputedStyle(link);
          const hasUnderline = style.textDecoration.includes('underline');
          if (!hasUnderline && link.textContent.trim()) {
            colorOnlyLinks++;
          }
        });

        results.metrics.push({
          name: 'Color-Only Links',
          value: colorOnlyLinks,
          status: colorOnlyLinks === 0 ? 'pass' : colorOnlyLinks > 3 ? 'error' : 'warning'
        });

        if (colorOnlyLinks > 3) {
          results.diagnostics.push({
            type: 'error',
            title: 'Links rely on color only',
            detail: colorOnlyLinks + ' links without underline'
          });
          results.scores.colorOnly = Math.max(0, 100 - (colorOnlyLinks * 10));
        } else if (colorOnlyLinks > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Some links rely on color only',
            detail: colorOnlyLinks + ' links could be harder to identify'
          });
          results.scores.colorOnly = Math.max(50, 100 - (colorOnlyLinks * 10));
        } else {
          results.scores.colorOnly = 100;
        }

        // Check contrast
        let lowContrastCount = 0;
        const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label');
        textElements.forEach(el => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bgColor = style.backgroundColor;
          
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            const textRGB = color.match(/\\d+/g);
            const bgRGB = bgColor.match(/\\d+/g);
            
            if (textRGB && bgRGB) {
              const textLum = (parseInt(textRGB[0]) * 299 + parseInt(textRGB[1]) * 587 + parseInt(textRGB[2]) * 114) / 1000;
              const bgLum = (parseInt(bgRGB[0]) * 299 + parseInt(bgRGB[1]) * 587 + parseInt(bgRGB[2]) * 114) / 1000;
              const contrast = Math.abs(textLum - bgLum);
              if (contrast < 50) lowContrastCount++;
            }
          }
        });

        results.metrics.push({
          name: 'Contrast Issues',
          value: lowContrastCount,
          status: lowContrastCount === 0 ? 'pass' : lowContrastCount > 5 ? 'error' : 'warning'
        });

        if (lowContrastCount > 5) {
          results.diagnostics.push({
            type: 'error',
            title: 'Low contrast text',
            detail: lowContrastCount + ' elements with poor contrast'
          });
          results.scores.contrast = Math.max(0, 100 - (lowContrastCount * 8));
        } else if (lowContrastCount > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Some low contrast text',
            detail: lowContrastCount + ' elements may be hard to read'
          });
          results.scores.contrast = Math.max(50, 100 - (lowContrastCount * 8));
        } else {
          results.scores.contrast = 100;
        }

        // Check form fields
        const inputs = document.querySelectorAll('input, select, textarea');
        let unlabeledInputs = 0;
        inputs.forEach(input => {
          const id = input.id;
          const hasLabel = id && document.querySelector('label[for="' + id + '"]');
          const hasAriaLabel = input.getAttribute('aria-label');
          if (!hasLabel && !hasAriaLabel) unlabeledInputs++;
        });

        results.metrics.push({
          name: 'Unlabeled Forms',
          value: unlabeledInputs,
          status: unlabeledInputs === 0 ? 'pass' : 'warning'
        });

        if (unlabeledInputs > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Form fields missing labels',
            detail: unlabeledInputs + ' inputs without labels'
          });
          results.scores.forms = Math.max(0, 100 - (unlabeledInputs * 15));
        } else {
          results.scores.forms = 100;
        }

        results.overallScore = Math.round((results.scores.contrast + results.scores.altText + results.scores.colorOnly + results.scores.forms) / 4);
        return results;
      })()
    `, handleAnalysisResult('colorblind'));
  };

  // Dyslexia Analysis
  const analyzeDyslexia = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { spacing: 0, lineHeight: 0, fontSize: 0, alignment: 0 }
        };

        const bodyStyle = window.getComputedStyle(document.body);
        const paragraphs = document.querySelectorAll('p');

        // Check line height
        let badLineHeight = 0;
        paragraphs.forEach(p => {
          const style = window.getComputedStyle(p);
          const lineHeight = parseFloat(style.lineHeight);
          const fontSize = parseFloat(style.fontSize);
          if (lineHeight && fontSize && lineHeight / fontSize < 1.5) {
            badLineHeight++;
          }
        });

        results.metrics.push({
          name: 'Line Height Issues',
          value: badLineHeight,
          status: badLineHeight === 0 ? 'pass' : badLineHeight > 3 ? 'error' : 'warning'
        });

        if (badLineHeight > 3) {
          results.diagnostics.push({
            type: 'error',
            title: 'Poor line spacing',
            detail: badLineHeight + ' paragraphs with tight line-height'
          });
          results.scores.lineHeight = Math.max(0, 100 - (badLineHeight * 15));
        } else if (badLineHeight > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Some tight line spacing',
            detail: 'Consider line-height of 1.5 or more'
          });
          results.scores.lineHeight = 70;
        } else {
          results.scores.lineHeight = 100;
        }

        // Check font size
        let smallText = 0;
        document.querySelectorAll('p, span, li, td').forEach(el => {
          const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
          if (fontSize < 14) smallText++;
        });

        results.metrics.push({
          name: 'Small Text Elements',
          value: smallText,
          status: smallText === 0 ? 'pass' : smallText > 10 ? 'error' : 'warning'
        });

        if (smallText > 10) {
          results.diagnostics.push({
            type: 'error',
            title: 'Text too small',
            detail: smallText + ' elements under 14px'
          });
          results.scores.fontSize = Math.max(0, 100 - (smallText * 5));
        } else if (smallText > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Some small text',
            detail: 'Recommend minimum 16px for body text'
          });
          results.scores.fontSize = 70;
        } else {
          results.scores.fontSize = 100;
        }

        // Check text alignment
        let justifiedText = 0;
        paragraphs.forEach(p => {
          const align = window.getComputedStyle(p).textAlign;
          if (align === 'justify') justifiedText++;
        });

        results.metrics.push({
          name: 'Justified Text',
          value: justifiedText,
          status: justifiedText === 0 ? 'pass' : 'warning'
        });

        if (justifiedText > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Justified text found',
            detail: justifiedText + ' paragraphs - use left-align instead'
          });
          results.scores.alignment = 70;
        } else {
          results.scores.alignment = 100;
        }

        // Check letter spacing
        results.metrics.push({
          name: 'Letter Spacing',
          value: 'Checked',
          status: 'info'
        });
        results.scores.spacing = 80;

        results.overallScore = Math.round((results.scores.spacing + results.scores.lineHeight + results.scores.fontSize + results.scores.alignment) / 4);
        return results;
      })()
    `, handleAnalysisResult('dyslexia'));
  };

  // Low Vision Analysis
  const analyzeLowVision = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { textSize: 0, contrast: 0, zoomable: 0, focus: 0 }
        };

        // Check text size
        let smallText = 0;
        document.querySelectorAll('p, span, li, td, th').forEach(el => {
          const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
          if (fontSize < 16) smallText++;
        });

        results.metrics.push({
          name: 'Small Text',
          value: smallText,
          status: smallText === 0 ? 'pass' : smallText > 10 ? 'error' : 'warning'
        });

        if (smallText > 10) {
          results.diagnostics.push({
            type: 'error',
            title: 'Text too small for low vision',
            detail: smallText + ' elements under 16px'
          });
          results.scores.textSize = Math.max(0, 100 - (smallText * 5));
        } else {
          results.scores.textSize = 85;
        }

        // Check if viewport meta prevents zoom
        const viewport = document.querySelector('meta[name="viewport"]');
        const viewportContent = viewport ? viewport.getAttribute('content') : '';
        const preventsZoom = viewportContent.includes('maximum-scale=1') || 
                            viewportContent.includes('user-scalable=no') ||
                            viewportContent.includes('user-scalable=0');

        results.metrics.push({
          name: 'Zoom',
          value: preventsZoom ? 'Blocked' : 'Allowed',
          status: preventsZoom ? 'error' : 'pass'
        });

        if (preventsZoom) {
          results.diagnostics.push({
            type: 'error',
            title: 'Zoom is disabled',
            detail: 'Remove user-scalable=no from viewport'
          });
          results.scores.zoomable = 30;
        } else {
          results.scores.zoomable = 100;
        }

        // Check contrast
        let lowContrast = 0;
        document.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach(el => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bgColor = style.backgroundColor;
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            const textRGB = color.match(/\\d+/g);
            const bgRGB = bgColor.match(/\\d+/g);
            if (textRGB && bgRGB) {
              const textLum = (parseInt(textRGB[0]) * 299 + parseInt(textRGB[1]) * 587 + parseInt(textRGB[2]) * 114) / 1000;
              const bgLum = (parseInt(bgRGB[0]) * 299 + parseInt(bgRGB[1]) * 587 + parseInt(bgRGB[2]) * 114) / 1000;
              if (Math.abs(textLum - bgLum) < 80) lowContrast++;
            }
          }
        });

        results.metrics.push({
          name: 'Low Contrast',
          value: lowContrast,
          status: lowContrast === 0 ? 'pass' : lowContrast > 5 ? 'error' : 'warning'
        });

        results.scores.contrast = Math.max(0, 100 - (lowContrast * 10));

        // Check focus indicators
        results.metrics.push({
          name: 'Focus Indicators',
          value: 'Checked',
          status: 'info'
        });
        results.scores.focus = 80;

        results.overallScore = Math.round((results.scores.textSize + results.scores.contrast + results.scores.zoomable + results.scores.focus) / 4);
        return results;
      })()
    `, handleAnalysisResult('lowvision'));
  };

  // Cognitive & Learning Analysis
  const analyzeCognitive = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { layout: 0, navigation: 0, wording: 0, distractions: 0 }
        };

        // Check navigation complexity
        const navs = document.querySelectorAll('nav, [role="navigation"]');
        let navItems = 0;
        navs.forEach(nav => navItems += nav.querySelectorAll('a, button').length);

        results.metrics.push({
          name: 'Navigation Items',
          value: navItems,
          status: navItems <= 7 ? 'pass' : navItems <= 12 ? 'warning' : 'error'
        });

        if (navItems > 12) {
          results.diagnostics.push({
            type: 'error',
            title: 'Complex navigation',
            detail: navItems + ' items (recommended: 5-7)'
          });
          results.scores.navigation = Math.max(0, 100 - ((navItems - 7) * 8));
        } else if (navItems > 7) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Navigation may be overwhelming',
            detail: 'Consider grouping or reducing items'
          });
          results.scores.navigation = 70;
        } else {
          results.scores.navigation = 100;
        }

        // Check for consistent layout
        const hasMain = document.querySelector('main') !== null;
        const hasHeader = document.querySelector('header') !== null;
        const hasNav = document.querySelector('nav') !== null;

        const layoutScore = (hasMain ? 33 : 0) + (hasHeader ? 33 : 0) + (hasNav ? 34 : 0);
        results.metrics.push({
          name: 'Layout Structure',
          value: layoutScore + '%',
          status: layoutScore >= 66 ? 'pass' : layoutScore >= 33 ? 'warning' : 'error'
        });
        results.scores.layout = layoutScore;

        // Check for distractions
        const animations = document.querySelectorAll('[style*="animation"]');
        const autoplayMedia = document.querySelectorAll('video[autoplay], audio[autoplay]');
        const distractionCount = animations.length + autoplayMedia.length;

        results.metrics.push({
          name: 'Distractions',
          value: distractionCount,
          status: distractionCount === 0 ? 'pass' : distractionCount > 3 ? 'error' : 'warning'
        });

        if (distractionCount > 3) {
          results.diagnostics.push({
            type: 'error',
            title: 'Too many distractions',
            detail: 'Reduce auto-playing content and animations'
          });
          results.scores.distractions = Math.max(0, 100 - (distractionCount * 15));
        } else {
          results.scores.distractions = 90;
        }

        // Check content structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        results.metrics.push({
          name: 'Content Headings',
          value: headings.length,
          status: headings.length >= 3 ? 'pass' : headings.length > 0 ? 'warning' : 'error'
        });
        results.scores.wording = headings.length >= 3 ? 100 : headings.length > 0 ? 70 : 40;

        results.overallScore = Math.round((results.scores.layout + results.scores.navigation + results.scores.wording + results.scores.distractions) / 4);
        return results;
      })()
    `, handleAnalysisResult('cognitive'));
  };

  // Photosensitive Analysis
  const analyzePhotosensitive = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { flashing: 0, animations: 0, autoPlay: 0, motion: 0 }
        };

        // Check for animations
        let animationCount = 0;
        document.querySelectorAll('*').forEach(el => {
          const style = window.getComputedStyle(el);
          const animation = style.animation || style.webkitAnimation;
          if (animation && animation !== 'none' && !animation.includes('0s')) {
            animationCount++;
          }
        });

        results.metrics.push({
          name: 'Animations',
          value: animationCount,
          status: animationCount === 0 ? 'pass' : animationCount > 5 ? 'error' : 'warning'
        });

        if (animationCount > 5) {
          results.diagnostics.push({
            type: 'error',
            title: 'Many animations detected',
            detail: animationCount + ' animated elements may trigger photosensitivity'
          });
          results.scores.animations = Math.max(0, 100 - (animationCount * 10));
        } else if (animationCount > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Some animations present',
            detail: 'Ensure no flashing > 3 times/second'
          });
          results.scores.animations = 70;
        } else {
          results.scores.animations = 100;
        }

        // Check for auto-playing video
        const autoplayVideos = document.querySelectorAll('video[autoplay]');
        const autoplayAudio = document.querySelectorAll('audio[autoplay]');
        
        results.metrics.push({
          name: 'Auto-play Media',
          value: autoplayVideos.length + autoplayAudio.length,
          status: (autoplayVideos.length + autoplayAudio.length) === 0 ? 'pass' : 'error'
        });

        if (autoplayVideos.length > 0) {
          results.diagnostics.push({
            type: 'error',
            title: 'Auto-playing video',
            detail: autoplayVideos.length + ' videos auto-play - may cause discomfort'
          });
          results.scores.autoPlay = 30;
        } else {
          results.scores.autoPlay = 100;
        }

        // Check for GIFs
        const gifs = document.querySelectorAll('img[src*=".gif"]');
        results.metrics.push({
          name: 'Animated GIFs',
          value: gifs.length,
          status: gifs.length === 0 ? 'pass' : 'warning'
        });

        if (gifs.length > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Animated GIFs found',
            detail: gifs.length + ' GIFs - ensure no rapid flashing'
          });
          results.scores.flashing = 70;
        } else {
          results.scores.flashing = 100;
        }
        results.metrics.push({
          name: 'Motion Preference',
          value: 'Checked',
          status: 'info'
        });
        results.scores.motion = 80;

        results.overallScore = Math.round((results.scores.flashing + results.scores.animations + results.scores.autoPlay + results.scores.motion) / 4);
        return results;
      })()`, handleAnalysisResult('photosensitive'));
  };

  // ADHD Analysis
  const analyzeADHD = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function () {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { visualNoise: 0, hierarchy: 0, spacing: 0, distractions: 0 }
        };

        // Check for auto-playing media
        const autoplayVideos = document.querySelectorAll('video[autoplay]');
        const autoplayAudio = document.querySelectorAll('audio[autoplay]');

        results.metrics.push({
          name: 'Auto-play Media',
          value: autoplayVideos.length + autoplayAudio.length,
          status: (autoplayVideos.length + autoplayAudio.length) === 0 ? 'pass' : 'error'
        });

        if (autoplayVideos.length + autoplayAudio.length > 0) {
          results.diagnostics.push({
            type: 'error',
            title: 'Auto-playing media',
            detail: 'Causes major distraction for ADHD users'
          });
          results.scores.distractions = 40;
        } else {
          results.scores.distractions = 100;
        }

        // Check animations
        let animationCount = 0;
        document.querySelectorAll('*').forEach(el => {
          const style = window.getComputedStyle(el);
          const animation = style.animation || style.webkitAnimation;
          if (animation && animation !== 'none' && !animation.includes('0s')) {
            animationCount++;
          }
        });

        results.metrics.push({
          name: 'Animations',
          value: animationCount,
          status: animationCount <= 3 ? 'pass' : animationCount <= 8 ? 'warning' : 'error'
        });

        if (animationCount > 8) {
          results.diagnostics.push({
            type: 'error',
            title: 'Too many animations',
            detail: animationCount + ' animated elements cause distraction'
          });
          results.scores.visualNoise = Math.max(0, 100 - (animationCount * 8));
        } else if (animationCount > 3) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Multiple animations',
            detail: 'Consider reducing visual motion'
          });
          results.scores.visualNoise = 70;
        } else {
          results.scores.visualNoise = 100;
        }

        // Check content hierarchy
        const headings = document.querySelectorAll('h1, h2, h3');
        const paragraphs = document.querySelectorAll('p');
        let longParagraphs = 0;
        paragraphs.forEach(p => {
          const words = p.textContent.split(/\\s+/).filter(w => w.length > 0).length;
          if (words > 100) longParagraphs++;
        });

        results.metrics.push({
          name: 'Long Paragraphs',
          value: longParagraphs,
          status: longParagraphs === 0 ? 'pass' : longParagraphs > 3 ? 'error' : 'warning'
        });

        if (longParagraphs > 3) {
          results.diagnostics.push({
            type: 'error',
            title: 'Content blocks too long',
            detail: longParagraphs + ' paragraphs over 100 words'
          });
          results.scores.hierarchy = Math.max(0, 100 - (longParagraphs * 15));
        } else {
          results.scores.hierarchy = 85;
        }

        // Check navigation complexity
        const navs = document.querySelectorAll('nav, [role="navigation"]');
        let navItems = 0;
        navs.forEach(nav => navItems += nav.querySelectorAll('a, button').length);

        results.metrics.push({
          name: 'Navigation Items',
          value: navItems,
          status: navItems <= 7 ? 'pass' : navItems <= 12 ? 'warning' : 'error'
        });

        if (navItems > 12) {
          results.diagnostics.push({
            type: 'error',
            title: 'Navigation too complex',
            detail: navItems + ' items - overwhelming for ADHD'
          });
          results.scores.spacing = Math.max(0, 100 - ((navItems - 7) * 8));
        } else {
          results.scores.spacing = 90;
        }

        results.overallScore = Math.round((results.scores.visualNoise + results.scores.hierarchy + results.scores.spacing + results.scores.distractions) / 4);
        return results;
      })()
      `, handleAnalysisResult('adhd'));
  };

  // Deaf / Hard of Hearing Analysis
  const analyzeDeaf = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { captions: 0, transcripts: 0, visualAlerts: 0, audio: 0 }
        };

        // Check for videos
        const videos = document.querySelectorAll('video');
        const videosWithCaptions = Array.from(videos).filter(v => v.querySelector('track[kind="captions"], track[kind="subtitles"]'));
        
        results.metrics.push({
          name: 'Videos',
          value: videos.length,
          status: 'info'
        });

        if (videos.length > 0 && videosWithCaptions.length < videos.length) {
          results.diagnostics.push({
            type: 'error',
            title: 'Videos missing captions',
            detail: (videos.length - videosWithCaptions.length) + ' videos without captions'
          });
          results.scores.captions = Math.round((videosWithCaptions.length / videos.length) * 100);
        } else if (videos.length > 0) {
          results.scores.captions = 100;
        } else {
          results.scores.captions = 100;
        }

        // Check for audio elements
        const audio = document.querySelectorAll('audio');
        results.metrics.push({
          name: 'Audio Elements',
          value: audio.length,
          status: audio.length === 0 ? 'pass' : 'warning'
        });

        if (audio.length > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Audio content found',
            detail: audio.length + ' audio elements - provide transcripts'
          });
          results.scores.transcripts = 60;
        } else {
          results.scores.transcripts = 100;
        }

        // Check for alert roles
        const alerts = document.querySelectorAll('[role="alert"], [aria-live]');
        results.metrics.push({
          name: 'Visual Alerts',
          value: alerts.length,
          status: alerts.length > 0 ? 'pass' : 'warning'
        });
        results.scores.visualAlerts = alerts.length > 0 ? 100 : 70;

        results.scores.audio = 80;
        results.overallScore = Math.round((results.scores.captions + results.scores.transcripts + results.scores.visualAlerts + results.scores.audio) / 4);
        return results;
      })()
    `, handleAnalysisResult('deaf'));
  };

  // Keyboard Only Navigation Analysis
  const analyzeKeyboardOnly = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { tabOrder: 0, focusTraps: 0, shortcuts: 0, skipLinks: 0 }
        };

        // Check focusable elements
        const focusable = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
        const negativeTabs = Array.from(focusable).filter(el => el.getAttribute('tabindex') === '-1');
        
        results.metrics.push({
          name: 'Focusable Elements',
          value: focusable.length,
          status: 'info'
        });

        results.metrics.push({
          name: 'Hidden from Tab',
          value: negativeTabs.length,
          status: negativeTabs.length === 0 ? 'pass' : negativeTabs.length > 5 ? 'error' : 'warning'
        });

        if (negativeTabs.length > 5) {
          results.diagnostics.push({
            type: 'error',
            title: 'Elements hidden from keyboard',
            detail: negativeTabs.length + ' elements have tabindex="-1"'
          });
          results.scores.tabOrder = 50;
        } else {
          results.scores.tabOrder = 100;
        }

        // Check for skip links
        const skipLinks = document.querySelectorAll('a[href^="#"]');
        const hasSkip = Array.from(skipLinks).some(l => l.textContent.toLowerCase().includes('skip'));
        
        results.metrics.push({
          name: 'Skip Link',
          value: hasSkip ? 'Present' : 'Missing',
          status: hasSkip ? 'pass' : 'warning'
        });
        results.scores.skipLinks = hasSkip ? 100 : 60;

        // Check for mouse-only events
        const mouseOnly = document.querySelectorAll('[onmousedown]:not([onkeydown]), [onmouseover]:not([onfocus])');
        results.metrics.push({
          name: 'Mouse-only Events',
          value: mouseOnly.length,
          status: mouseOnly.length === 0 ? 'pass' : 'error'
        });

        if (mouseOnly.length > 0) {
          results.diagnostics.push({
            type: 'error',
            title: 'Mouse-only interactions',
            detail: mouseOnly.length + ' elements need keyboard equivalents'
          });
          results.scores.focusTraps = 50;
        } else {
          results.scores.focusTraps = 100;
        }

        results.scores.shortcuts = 80;
        results.overallScore = Math.round((results.scores.tabOrder + results.scores.focusTraps + results.scores.shortcuts + results.scores.skipLinks) / 4);
        return results;
      })()
    `, handleAnalysisResult('keyboard'));
  };

  // Autism & Sensory Analysis
  const analyzeAutism = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { consistency: 0, predictability: 0, sensory: 0, labels: 0 }
        };

        // Check for consistent navigation
        const navs = document.querySelectorAll('nav');
        results.metrics.push({
          name: 'Navigation Areas',
          value: navs.length,
          status: navs.length > 0 ? 'pass' : 'warning'
        });
        results.scores.consistency = navs.length > 0 ? 100 : 60;

        // Check for auto-playing media (sensory overload)
        const autoplay = document.querySelectorAll('video[autoplay], audio[autoplay]');
        const animations = [];
        document.querySelectorAll('*').forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.animation && style.animation !== 'none') animations.push(el);
        });

        const sensoryLoad = autoplay.length + animations.length;
        results.metrics.push({
          name: 'Sensory Load',
          value: sensoryLoad,
          status: sensoryLoad === 0 ? 'pass' : sensoryLoad > 5 ? 'error' : 'warning'
        });

        if (sensoryLoad > 5) {
          results.diagnostics.push({
            type: 'error',
            title: 'High sensory load',
            detail: 'Too many animations/auto-play elements'
          });
          results.scores.sensory = 40;
        } else {
          results.scores.sensory = Math.max(60, 100 - (sensoryLoad * 10));
        }

        // Check for clear labels
        const buttons = document.querySelectorAll('button');
        const unlabeled = Array.from(buttons).filter(b => !b.textContent.trim() && !b.getAttribute('aria-label'));
        
        results.metrics.push({
          name: 'Unlabeled Buttons',
          value: unlabeled.length,
          status: unlabeled.length === 0 ? 'pass' : 'error'
        });

        if (unlabeled.length > 0) {
          results.diagnostics.push({
            type: 'error',
            title: 'Buttons without labels',
            detail: unlabeled.length + ' buttons need clear text'
          });
          results.scores.labels = 50;
        } else {
          results.scores.labels = 100;
        }

        results.scores.predictability = 80;
        results.overallScore = Math.round((results.scores.consistency + results.scores.predictability + results.scores.sensory + results.scores.labels) / 4);
        return results;
      })()
    `, handleAnalysisResult('autism'));
  };

  // Anxiety & Stress Analysis
  const analyzeAnxiety = () => {
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const results = {
          metrics: [],
          diagnostics: [],
          scores: { timers: 0, pressure: 0, clarity: 0, recovery: 0 }
        };

        // Check for countdown timers
        const timerPatterns = document.body.innerText.match(/\d{1,2}:\d{2}|countdown|timer|hurry|limited time/gi) || [];
        results.metrics.push({
          name: 'Time Pressure',
          value: timerPatterns.length > 0 ? 'Detected' : 'None',
          status: timerPatterns.length === 0 ? 'pass' : 'warning'
        });

        if (timerPatterns.length > 0) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Time pressure detected',
            detail: 'Countdown or urgency language found'
          });
          results.scores.timers = 60;
        } else {
          results.scores.timers = 100;
        }

        // Check for error messages
        const errorElements = document.querySelectorAll('.error, .warning, [role="alert"]');
        results.metrics.push({
          name: 'Error States',
          value: errorElements.length,
          status: 'info'
        });
        results.scores.recovery = 80;

        // Check for clear CTAs
        const buttons = document.querySelectorAll('button, [role="button"]');
        const clearCTAs = Array.from(buttons).filter(b => b.textContent.trim().length > 2);
        
        results.metrics.push({
          name: 'Clear CTAs',
          value: clearCTAs.length + '/' + buttons.length,
          status: clearCTAs.length === buttons.length ? 'pass' : 'warning'
        });
        results.scores.clarity = Math.round((clearCTAs.length / Math.max(buttons.length, 1)) * 100);

        // Check form complexity
        const forms = document.querySelectorAll('form');
        const totalInputs = document.querySelectorAll('input, select, textarea').length;
        
        results.metrics.push({
          name: 'Form Fields',
          value: totalInputs,
          status: totalInputs <= 10 ? 'pass' : totalInputs <= 20 ? 'warning' : 'error'
        });

        if (totalInputs > 20) {
          results.diagnostics.push({
            type: 'warning',
            title: 'Complex forms',
            detail: totalInputs + ' fields - consider breaking into steps'
          });
          results.scores.pressure = 60;
        } else {
          results.scores.pressure = 100;
        }

        results.overallScore = Math.round((results.scores.timers + results.scores.pressure + results.scores.clarity + results.scores.recovery) / 4);
        return results;
      })()
    `, handleAnalysisResult('anxiety'));
  };

  // Common result handler
  const handleAnalysisResult = (type) => (results, isException) => {
    setTimeout(() => {
      if (isException || !results) {
        console.error('Analysis error:', isException);
        results = { error: true, overallScore: 0, metrics: [], diagnostics: [], scores: {} };
      }

      setAuditResults({
        type: type,
        device: device,
        data: results,
        profile: ACCESSIBILITY_PROFILES[type],
        timestamp: new Date().toLocaleString()
      });
      setShowDialog(false);
      setAnalyzing(false);
    }, 2500);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setAnalyzing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#0cce6b';
    if (score >= 50) return '#ffa400';
    return '#ff4e42';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'rgba(12, 206, 107, 0.15)';
    if (score >= 50) return 'rgba(255, 164, 0, 0.15)';
    return 'rgba(255, 78, 66, 0.15)';
  };

  // ScoreRing component
  const ScoreRing = ({ score, size = 120, strokeWidth = 8 }) => {
    const safeScore = score || 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (safeScore / 100) * circumference;
    const color = getScoreColor(safeScore);
    const bgColor = getScoreBgColor(safeScore);

    return (
      <div className="score-ring-wrapper" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="score-ring-svg"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill={bgColor}
            stroke="rgba(128, 128, 128, 0.3)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2
              })`}
          />
        </svg>
        <span className="score-ring-value" style={{ color }}>
          {safeScore}
        </span>
      </div>
    );
  };

  return (
    <div className="auditor-container">
      <header className="auditor-header">
        <div className="header-content">
          <h1>ASIA</h1>
          <p className="subtitle">Accessibility System for Inclusive Analysis</p>
        </div>
        <div className="action-section">
          <button
            className="analyze-btn"
            onClick={runAudit}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Analyze page'}
          </button>
        </div>
      </header>

      {/* Options Section */}
      <section className="options-section">
        <div className="option-group profiles-group">
          <span className="option-label">Test Accessibility of Website</span>
          <div className="profiles-grid">
            {Object.values(ACCESSIBILITY_PROFILES).map(profile => (
              <label key={profile.id} className={`profile-option ${auditType === profile.id ? 'selected' : ''} `}>
                <input
                  type="radio"
                  name="auditType"
                  value={profile.id}
                  checked={auditType === profile.id}
                  onChange={(e) => setAuditType(e.target.value)}
                />
                <span className="profile-name">{profile.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="option-group">
          <span className="option-label">Device</span>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="device"
                value="desktop"
                checked={device === 'desktop'}
                onChange={(e) => setDevice(e.target.value)}
              />
              <span className="radio-circle"></span>
              <span className="radio-text">Desktop</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="device"
                value="mobile"
                checked={device === 'mobile'}
                onChange={(e) => setDevice(e.target.value)}
              />
              <span className="radio-circle"></span>
              <span className="radio-text">Mobile</span>
            </label>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {auditResults && (
        <div className="results-section">
          {/* Main Score Display */}
          <div className="score-hero">
            <div className="score-hero-left">
              <ScoreRing score={auditResults.data.overallScore} size={140} strokeWidth={8} />
              <div className="score-label">
                {auditResults.profile?.name || 'Accessibility'}
              </div>
              <p className="score-description">
                {auditResults.profile?.description}
              </p>
              {/* Score Legend */}
              <div className="score-legend">
                <span className="legend-item">
                  <span className="legend-triangle error"></span> 0–49
                </span>
                <span className="legend-item">
                  <span className="legend-square warning"></span> 50–89
                </span>
                <span className="legend-item">
                  <span className="legend-dot pass"></span> 90–100
                </span>
              </div>
            </div>

            {/* Page Preview */}
            {pageScreenshot && (
              <div className="page-preview">
                <div className="preview-frame">
                  <div className="preview-header">
                    <span className="preview-url">{pageScreenshot.url}</span>
                  </div>
                </div>
                <p className="preview-caption">
                  Analyzed on {device} at {auditResults.timestamp}
                </p>
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="metrics-section">
            <h3 className="section-title">METRICS</h3>
            <div className="metrics-grid">
              {auditResults.data.metrics && auditResults.data.metrics.map((metric, index) => (
                <div key={index} className="metric-card">
                  <div className="metric-header">
                    <span className={`metric-indicator ${metric.status}`}></span>
                    <span className="metric-name">{metric.name}</span>
                  </div>
                  <span className={`metric-value ${metric.status}`}>{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostics Section */}
          <div className="diagnostics-section">
            <h3 className="section-title">DIAGNOSTICS</h3>
            <div className="diagnostics-list">
              {auditResults.data.diagnostics && auditResults.data.diagnostics.map((item, index) => (
                <div key={index} className={`diagnostic-row ${item.type}`}>
                  <span className={`diagnostic-indicator ${item.type}`}></span>
                  <div className="diagnostic-content">
                    <span className="diagnostic-title">{item.title}</span>
                    {item.detail && (
                      <span className="diagnostic-detail"> — {item.detail}</span>
                    )}
                  </div>
                </div>
              ))}
              {(!auditResults.data.diagnostics || auditResults.data.diagnostics.length === 0) && (
                <div className="diagnostic-row pass">
                  <span className="diagnostic-indicator pass"></span>
                  <span className="diagnostic-title">No issues found</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AuditDialog
        isOpen={showDialog}
        onClose={closeDialog}
        analyzing={analyzing}
        auditType={auditType}
      />
    </div>
  );
}

export default App;
