/**
 * @param {string} tag - Tag name of the desired HTML element.
 * @param {Object} attributes - Extra enformation about the desired element.
 * @param {(string|Array.<string>)} [attributes.classes] - The element's class names.
 * @param {Object} [attributes.data] - The element's data attributes.
 * @param {Object} [attributes.styles] - The element's styles.
 * @param {Array.<(string|HTMLElement)>} [attributes.content] - The element's child nodes.
 * @returns {HTMLElement} - The created element.
 */
function createElement(tag, attributes) {
  let elem = document.createElement(tag);

  if (typeof attributes !== 'object') attributes = {};

  if (typeof attributes.classes === 'string')
    elem.className = attributes.classes;
  else if (attributes.classes)
    attributes.classes.forEach(c => elem.classList.add(c));

  if (attributes.data)
    Object.keys(attributes.data).forEach(d => typeof attributes.data[d] === 'string' && (elem.dataset[d] = attributes.data[d]));

  if (attributes.styles)
    Object.keys(attributes.styles).forEach(s => elem.style[s] = attributes.styles[s]);

  if (typeof attributes.content === 'string') elem.appendChild(createElementFromHTML(attributes.content));
  else if (attributes.content)
    attributes.content.forEach(e => e && elem.appendChild(typeof e === 'object' ? e : document.createTextNode(e)));

  if (attributes.value !== undefined) elem.value = attributes.value;
  if (attributes.tabindex !== undefined) elem.setAttribute('tabindex', attributes.tabindex);
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
