// js/includes.js
function includeHTML(callback) {
  const elements = document.querySelectorAll('[w3-include-html]');
  let loaded = 0;
  if (!elements.length) return callback?.();

  elements.forEach(el => {
    const file = el.getAttribute('w3-include-html');
    fetch(file)
      .then(res => res.text())
      .then(content => {
        el.innerHTML = content;
        el.removeAttribute('w3-include-html');
        loaded++;
        if (loaded === elements.length) callback?.();
      });
  });
}
