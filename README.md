# 🔍 Accessibility System Test - Chrome DevTools Extension

A comprehensive website analysis tool similar to Lighthouse, built with React. Analyze any website's performance, accessibility, SEO, and best practices directly from Chrome DevTools.

## ✨ Features

### 📊 **Core Audits**

2. **♿ Accessibility Checks**
   - Images without alt text
   - Links without descriptive text
   - Form inputs without labels
   - H1 heading presence
   - Language attribute
   - Page title

3. **🔍 SEO Optimization**
   - Title tag analysis
   - Meta description
   - Meta viewport
   - Canonical URL
   - H1 count
   - Open Graph tags

4. **✨ Best Practices**
   - HTTPS usage
   - Doctype declaration
   - Character set
   - Script analysis (external vs inline)

### 🎯 **Scoring System**
- **0-49**: Poor (Red) - Needs immediate attention
- **50-89**: Needs Improvement (Orange) - Good but can be better
- **90-100**: Good (Green) - Excellent performance

## 📦 Installation

### Quick Install (Ready to Use)

1. **Download the extension**
2. **Extract** the zip file
3. **Open Chrome** and go to `chrome://extensions/`
4. **Enable "Developer mode"** (toggle in top-right)
5. **Click "Load unpacked"**
6. **Select the `dist` folder**

### Development Setup

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Copy extension files
cp public/manifest.json public/devtools.html public/devtools.js dist/
```

## 🚀 Usage

1. Open any website in Chrome
2. Press **F12** to open DevTools
3. Look for the **"ASIA"** tab
4. Click **"Run Code"** button
5. Wait 2-3 seconds for analysis
6. Review your scores and detailed metrics!

## 📈 What Gets Analyzed


### Accessibility Issues
- Alt text for images
- Descriptive link text
- Form label associations
- Heading hierarchy
- Language declaration
- Page title

### SEO Factors
- Title length (30-60 chars)
- Meta description (120-160 chars)
- Mobile viewport
- Canonical URL
- Single H1
- Social media tags

### Best Practices
- HTTPS encryption
- Valid HTML doctype
- Character encoding
- Script optimization

## 🎨 Key Features

- **Real-time Analysis**: Analyzes the currently loaded page
- **Color-coded Scores**: Green (good), Orange (needs work), Red (poor)
- **Detailed Metrics**: Comprehensive breakdown of all issues
- **Beautiful UI**: Modern, responsive design
- **Lighthouse-inspired**: Familiar scoring system
- **Actionable Insights**: See exactly what needs fixing

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Chrome DevTools API** - Page inspection
- **Performance API** - Metrics collection
- **DOM API** - Element analysis

## 🔄 Making Changes

1. Edit files in `src/`
2. Run `npm run build`
3. Copy extension files: `cp public/*.{json,html,js} dist/`
4. Reload extension in Chrome (`chrome://extensions/`)
5. Close and reopen DevTools

## 💡 Tips

- Run audit on different pages to compare scores
- Use the detailed metrics to identify specific issues
- Green scores (90+) indicate excellent optimization
- Focus on orange/red areas for improvements

## 📝 License

MIT License - Feel free to modify and distribute!

---

**Built with ❤️ using React, Vite, and Chrome DevTools API**
