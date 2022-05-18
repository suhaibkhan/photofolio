export function ready(callback) {
  // in case the document is already rendered
  if (document.readyState != 'loading') callback();
  // modern browsers
  else if (document.addEventListener)
    document.addEventListener('DOMContentLoaded', callback);
  // IE <= 8
  else
    document.attachEvent('onreadystatechange', function () {
      if (document.readyState == 'complete') callback();
    });
}

export function load(callback) {
  window.addEventListener('load', callback);
}

export function selectById(id) {
  return document.getElementById(id);
}

export function onClick(elem, callback) {
  if (elem && elem.nodeType && elem.nodeType === 1) {
    elem.addEventListener('click', callback);
  } else {
    Array.prototype.forEach.call(elem, (item) => {
      item.addEventListener('click', callback);
    });
  }
}

export function addClass(elem, className) {
  const existClasses = elem.getAttribute('class');

  // check already present
  if (existClasses && existClasses.split(' ').indexOf(className) >= 0) {
    return;
  }

  let newClasses = className;
  if (existClasses) {
    newClasses = existClasses + ' ' + newClasses;
  }
  elem.setAttribute('class', newClasses);
}

export function removeClass(elem, className) {
  const existClasses = elem.getAttribute('class');

  // check if present
  if (!existClasses || existClasses.split(' ').indexOf(className) === -1) {
    return;
  }

  let newClasses = '';
  if (existClasses) {
    newClasses = existClasses
      .split(' ')
      .filter((cls) => cls !== className)
      .join(' ');
  }
  elem.setAttribute('class', newClasses);
}

export function innerWidth(elem) {
  const computedContStyle = getComputedStyle(elem);
  let containerWidth = elem.clientWidth;
  containerWidth -=
    parseFloat(computedContStyle.paddingLeft) +
    parseFloat(computedContStyle.paddingRight);
  return containerWidth;
}

export function innerHeight(elem) {
  const computedContStyle = getComputedStyle(elem);
  let containerHeight = elem.clientHeight;
  containerHeight -=
    parseFloat(computedContStyle.paddingTop) +
    parseFloat(computedContStyle.paddingBottom);
  return containerHeight;
}
