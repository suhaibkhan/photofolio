import './styles/photo-viewer.css';
import { addClass, innerHeight, innerWidth, removeClass, selectById } from './utils';

const CSS_CLASSES = {
  container: 'pv-container',
  parent: 'pv-image-container',
  animate: 'pv-animate',
  title: 'pv-title',
  disabled: 'disabled'
};

class PhotoViewer {
  constructor(container, images, options) {
    this.container = container;
    this.images = images;
    this.image = null;
    this.imageIdx = null;
    this.imgElem = null;
    this.imgParent = null;
    this.titleElem = null;
    this.nextBtn = null;
    this.prevBtn = null;
    this.viewerOpen = false;

    this.options = {
      imgPathPrefix: 'images/photos/',
      spacing: 0,
      animate: true,
      showTitle: true,
      titleHolder: null,
      ...options,
    };
    this.titleHolder = this.options.titleHolder
      ? selectById(this.options.titleHolder)
      : null;
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

    // title
    if (this.options.showTitle) {
      this.titleElem = document.createElement('div');
      this.titleElem.setAttribute('class', CSS_CLASSES.title);
      this.container.appendChild(this.titleElem);
    }

    document.body.addEventListener('keydown', (evt) => {
      if (!this.viewerOpen) {
        return;
      }

      const key = evt.key;
      if (key === 'ArrowUp' || key === 'ArrowLeft') {
        evt.preventDefault();
        this.navigate(false);
      } else if (key === 'ArrowDown' || key === 'ArrowRight') {
        evt.preventDefault();
        this.navigate(true);
      }
    });
  }

  setupToolbar() {
    const toolbar = document.createElement('div');
    toolbar.setAttribute('class', 'pv-toolbar');

    const closeBtn = document.createElement('span');
    closeBtn.setAttribute('class', 'material-symbols-outlined');
    closeBtn.innerHTML = '&#xe5cd;';

    const spacer = document.createElement('span');
    spacer.setAttribute('class', 'spacer');

    const prevBtn = document.createElement('span');
    prevBtn.setAttribute('class', 'material-symbols-outlined');
    prevBtn.innerHTML = '&#xe316;';
    this.prevBtn = prevBtn;

    const nextBtn = document.createElement('span');
    nextBtn.setAttribute('class', 'material-symbols-outlined');
    nextBtn.innerHTML = '&#xe313;';
    this.nextBtn = nextBtn;


    const maxBtn = document.createElement('span');
    maxBtn.setAttribute('class', 'material-symbols-outlined');
    maxBtn.innerText = 'fullscreen';

    toolbar.appendChild(closeBtn);
    toolbar.appendChild(spacer);
    toolbar.appendChild(prevBtn);
    toolbar.appendChild(nextBtn);
    // toolbar.appendChild(maxBtn);

    this.container.appendChild(toolbar);

    closeBtn.addEventListener('click', () => {
      this.close();
    });

    prevBtn.addEventListener('click', () => {
      this.navigate(false);
    });

    nextBtn.addEventListener('click', () => {
      this.navigate(true);
    });
  }

  navigate(next) {
    const newImgIdx = this.imageIdx + (next ? 1 : -1);
    if (newImgIdx < 0 || newImgIdx >= this.images.length) {
      return;
    }

    // hide title, remove img
    this.titleElem.style.display = 'none';
    this.imgElem.removeAttribute('src');

    // const containerHeight = innerHeight(this.container);
    // this.imgParent.style.top = `${(next ? -1 : 1) * (containerHeight + 10)}px`;
    // setTimeout(() => this.open(newImgIdx, null), 250);

    removeClass(this.imgParent, CSS_CLASSES.animate);
    this.open(newImgIdx, null);
  }

  updateNav() {
    // update nav buttons based on index
    if (this.imageIdx === 0) {
      addClass(this.prevBtn, CSS_CLASSES.disabled);
    } else {
      removeClass(this.prevBtn, CSS_CLASSES.disabled);
    }

    if (this.imageIdx === this.images.length - 1) {
      addClass(this.nextBtn, CSS_CLASSES.disabled);
    } else {
      removeClass(this.nextBtn, CSS_CLASSES.disabled);
    }
  }

  open(imageIdx, elem) {
    const { imgPathPrefix, animate } = this.options;
    this.imageIdx = imageIdx;

    // update nav buttons
    this.updateNav();

    const image = this.images[imageIdx];
    // set same position as thumb to animate
    if (animate && elem) {
      // addClass(this.imgParent, CSS_CLASSES.animate);
      const { x, y, width, height } = elem.getBoundingClientRect();
      this.imgParent.style.width = `${width}px`;
      this.imgParent.style.height = `${height}px`;
      this.imgParent.style.top = `${y}px`;
      this.imgParent.style.left = `${x}px`;
    }

    this.image = image;
    this.container.style.display = 'block';
    this.imgElem.setAttribute('src', imgPathPrefix + image.name);

    if (this.titleElem) {
      let title = image.title;
      if (this.titleHolder) {
        const titleTxtElem = this.titleHolder.querySelector(
          `div[data-img="${image.name}"]`
        );
        if (titleTxtElem && titleTxtElem.innerHTML) {
          title = titleTxtElem.innerHTML;
        }
      }
      this.titleElem.innerHTML = title || '';
      this.titleElem.style.display = title ? 'block' : 'none';
    }

    // position to full screen
    this.positionImage();
    this.viewerOpen = true;
    // if (animate) {
    //   // remove after animation
    //   setTimeout(() => removeClass(this.imgParent, CSS_CLASSES.animate), 1000);
    // }
  }

  close() {
    this.viewerOpen = false;
    this.container.style.display = 'none';
    this.imgElem.removeAttribute('src');
    
    // add animation back if removed
    if (this.options.animate) {
      addClass(this.imgParent, CSS_CLASSES.animate);
    }
  }

  positionImage() {
    const spacing = this.options.spacing;
    const titleHeight = this.titleElem ? this.titleElem.clientHeight : 0;
    const contWidth = innerWidth(this.container) - spacing * 2;
    const contHeight = innerHeight(this.container) - spacing * 2 - titleHeight;

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
    if (this.titleElem) {
      const titleTop = imgHeight + parseFloat(this.imgParent.style.top);
      this.titleElem.style.top = `${titleTop}px`;
    }
  }
}

export default function (...args) {
  return new PhotoViewer(...args);
}
