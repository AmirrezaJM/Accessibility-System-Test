// Register the ASIA panel in DevTools
chrome.devtools.panels.create(
  "ASIA",
  "",
  "index.html",
  function(panel) {
    console.log("ASIA panel created!");
  }
);
