import './styles/photo-viewer.css';
import { addClass, innerHeight, innerWidth } from './utils';

const CSS_CLASSES = {
  container: 'pv-container',
  parent: 'pv-image-container',
  animate: 'pv-animate',
};

class PhotoViewer {
  constructor(container, options) {
    this.container = container;
    this.image = null;
    this.imgElem = null;
    this.imgParent = null;
    this.options = {
      spacing: 10,
      animate: true,
      ...options,
    };
    this.init();

    let resizeTimer = null;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.positionImage();
        }, 50);
      },
      true
    );
  }

  init() {
    addClass(this.container, CSS_CLASSES.container);

    this.imgParent = document.createElement('div');
    const classes = [CSS_CLASSES.parent];
    if (this.options.animate) {
      classes.push(CSS_CLASSES.animate);
    }
    this.imgParent.setAttribute('class', classes.join(' '));

    this.imgElem = document.createElement('img');
    this.imgParent.appendChild(this.imgElem);

    this.container.appendChild(this.imgParent);
    this.setupToolbar();
  }

  setupToolbar() {
    const toolbar = document.createElement('div');
    toolbar.setAttribute('class', 'pv-toolbar');

    const closeBtn = document.createElement('span');
    closeBtn.setAttribute('class', 'material-symbols-outlined');
    closeBtn.innerText = 'close';

    const maxBtn = document.createElement('span');
    maxBtn.setAttribute('class', 'material-symbols-outlined');
    maxBtn.innerText = 'fullscreen';

    toolbar.appendChild(closeBtn);
    // toolbar.appendChild(maxBtn);

    this.container.appendChild(toolbar);

    closeBtn.addEventListener('click', () => {
      this.close();
    });
  }

  open(image, elem) {
    // set same position as thumb to animate
    if (this.options.animate) {
      // addClass(this.imgParent, CSS_CLASSES.animate);
      const { x, y, width, height } = elem.getBoundingClientRect();
      this.imgParent.style.width = `${width}px`;
      this.imgParent.style.height = `${height}px`;
      this.imgParent.style.top = `${y}px`;
      this.imgParent.style.left = `${x}px`;
    }

    this.image = image;
    this.container.style.display = 'block';
    this.imgElem.setAttribute('src', elem.getAttribute('src'));
    // position to full screen
    this.positionImage();

    // if (this.options.animate) {
    //   // remove after animation
    //   setTimeout(() => removeClass(this.imgParent, CSS_CLASSES.animate), 1000);
    // }
  }

  close() {
    this.container.style.display = 'none';
    this.imgElem.removeAttribute('src');
  }

  positionImage() {
    const spacing = this.options.spacing;
    const contWidth = innerWidth(this.container) - spacing * 2;
    const contHeight = innerHeight(this.container) - spacing * 2;

    const contLandscape = contWidth >= contHeight;
    const aspRatio = this.image.height / this.image.width;

    let imgWidth = contLandscape ? contHeight / aspRatio : contWidth;
    let imgHeight = contLandscape ? contHeight : contWidth * aspRatio;

    if (imgHeight > contHeight) {
      imgHeight = contHeight;
      imgWidth = imgHeight / aspRatio;
    }

    if (imgWidth > contWidth) {
      imgWidth = contWidth;
      imgHeight = imgWidth * aspRatio;
    }

    this.imgParent.style.width = `${imgWidth}px`;
    this.imgParent.style.height = `${imgHeight}px`;
    this.imgParent.style.top = `${(contHeight - imgHeight) / 2 + spacing}px`;
    this.imgParent.style.left = `${(contWidth - imgWidth) / 2 + spacing}px`;
  }
}

export default function (...args) {
  return new PhotoViewer(...args);
}
