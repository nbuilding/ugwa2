// TODO: make the types more regular

const svgNS = 'http://www.w3.org/2000/svg';

/**
 * @param {string} tag - Tag name of the desired HTML element.
 * @param {Object} attributes - Extra enformation about the desired element.
 * @param {(string|Array.<string>)} [attributes.classes] - The element's class names.
 * @param {Object} [attributes.data] - The element's data attributes.
 * @param {Object} [attributes.styles] - The element's styles.
 * @param {Array.<(string|Node)>} [attributes.content] - The element's child nodes.
 * @returns {HTMLElement} - The created element.
 */
function createElement(tag, attributes) {
  if (typeof attributes !== 'object') attributes = {};

  let elem = attributes.svg ? document.createElementNS(svgNS, tag) : document.createElement(tag);

  if (typeof attributes.classes === 'string')
    elem.className = attributes.classes;
  else if (attributes.classes)
    attributes.classes.forEach(c => c && elem.classList.add(c));

  if (attributes.data)
    Object.keys(attributes.data).forEach(d => typeof attributes.data[d] === 'string' && (elem.dataset[d] = attributes.data[d]));

  if (attributes.attr)
    Object.keys(attributes.attr).forEach(d => attributes.attr[d] !== undefined && (attributes.svg ? elem.setAttributeNS(null, d, attributes.attr[d]) : elem.setAttribute(d, attributes.attr[d])));

  if (attributes.styles)
    Object.keys(attributes.styles).forEach(s => elem.style[s] = attributes.styles[s]);

  if (typeof attributes.content === 'string') elem.innerHTML = attributes.content;
  else if (attributes.content)
    attributes.content.forEach(e => e && elem.appendChild(typeof e === 'object' ? e : document.createTextNode(e)));

  if (attributes.value !== undefined) elem.value = attributes.value;
  if (attributes.tabindex !== undefined && typeof attributes.tabindex !== 'boolean')
    elem.setAttribute('tabindex', attributes.tabindex);
  if (attributes.disabled !== undefined) elem.disabled = attributes.disabled;
  if (attributes.readOnly !== undefined) elem.readOnly = attributes.readOnly;
  if (attributes.type !== undefined) elem.type = attributes.type;
  if (attributes.ripple) hasMaterialRipple(elem, attributes.roundRipple);

  return elem;
}

/**
 * @param {string} html - The HTML.
 * @returns {DocumentFragment} - The elements.
 */
function createElementFromHTML(html) {
  let tempDiv = document.createElement('div'),
  fragment = document.createDocumentFragment();
  tempDiv.innerHTML = html;
  Array.from(tempDiv.childNodes).forEach(e => fragment.appendChild(e));
  return fragment;
}

/**
 * @param {string} text - the text to measure
 * @param {HTMLElement} fontStyle - the element to base the styles of
 * @param {(boolean)} wrap - whether it should account for wrapping
 * @returns {Object} - the height and width of the text
 * @returns {Object.height} - the height of the text in pixels
 * @returns {Object.width} - the width of the text in pixels
 */
function getTextSize(text, fontStyle, wrap) {
  const styles = window.getComputedStyle(fontStyle);
  const dummy = createElement('text-size-measurer', {
    styles: {
      font: styles.font,
      letterSpacing: styles.letterSpacing,
      whiteSpace: wrap ? 'pre-wrap' : 'pre',
      display: 'inline-block',
      position: 'fixed',
      overflow: 'auto',
      width: wrap ? styles.width : null
    },
    content: [text]
  });
  document.body.appendChild(dummy);
  const rect = dummy.getBoundingClientRect();
  document.body.removeChild(dummy);
  return {
    width: rect.width,
    height: rect.height
  };
}
