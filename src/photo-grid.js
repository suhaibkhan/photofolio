import './styles/photo-grid.css';
import { innerWidth } from './utils';

const CSS_CLASSES = { container: 'pg-image-grid', item: 'pg-image-item' };

class PhotoGrid {
  constructor(container, images, options) {
    this.container = container;
    this.allImages = images;
    this.images = images;
    this.options = {
      imgPathPrefix: 'images/photos/',
      spacing: 0,
      // columns can be fixed number or multiple numbers with max width
      columns: [
        { maxWidth: 600, count: 2 },
        { maxWidth: 1200, count: 3 },
      ],
      onImageClick: (image, event) => {},
      ...options,
    };

    if (Array.isArray(this.options.columns)) {
      // sort by max width
      this.options.columns.sort((a, b) => +b.maxWidth - +a.maxWidth);
    }

    this.imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          const src = lazyImage.getAttribute('data-src');
          lazyImage.setAttribute('src', src);
          this.imageObserver.unobserve(lazyImage);
        }
      });
    });
    this.imgItems = [];
    this.addImages();

    let resizeTimer = null;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.positionImages();
        }, 50);
      },
      true
    );
  }

  getColumns() {
    if (typeof this.options.columns === 'number') {
      return this.options.columns;
    }

    if (
      Array.isArray(this.options.columns) &&
      this.options.columns.length > 0
    ) {
      const winWidth = window.innerWidth;
      const colOpts = this.options.columns.filter(
        (item) => +item.maxWidth <= winWidth
      );
      if (colOpts.length > 0) {
        return colOpts[0].count;
      }
    }

    return 1;
  }

  filterImages(filterFn) {
    this.images = this.allImages.filter(filterFn);
    this.addImages();
  }

  addImages() {
    const { imgPathPrefix } = this.options;

    // clear existing
    this.container.innerHTML = '';
    this.imgItems = [];

    this.gridContainer = document.createElement('div');
    this.gridContainer.setAttribute('class', CSS_CLASSES.container);

    const imageClickHandler = this.options.onImageClick;

    this.images.forEach((img) => {
      const imgParentElem = document.createElement('div');
      imgParentElem.setAttribute('class', CSS_CLASSES.item);

      const imgElem = document.createElement('img');
      imgElem.setAttribute('data-src', imgPathPrefix + img.name);
      imgParentElem.appendChild(imgElem);

      imgParentElem.addEventListener('click', (event) => {
        imageClickHandler && imageClickHandler(img, imgElem, event);
      });

      this.imgItems.push(imgParentElem);
      this.imageObserver.observe(imgElem);
      this.gridContainer.appendChild(imgParentElem);
    });

    this.positionImages();
    this.container.appendChild(this.gridContainer);
  }

  positionImages() {
    const { spacing } = this.options;
    const columns = this.getColumns();
    const totalWidthSpacing = spacing * (columns - 1); // spacing only in between

    const containerWidth = innerWidth(this.container);
    const imgWidth = (containerWidth - totalWidthSpacing) / columns;

    const colHeights = Array(columns).fill(0);
    let i = 0;
    let col = 0;

    while (i < this.images.length) {
      const nextCol = (col + 1) % columns;

      // if column height before adding image is
      // already greater than next column, move current img to next col
      if (colHeights[col] > colHeights[nextCol]) {
        col = nextCol;
        continue;
      }

      // calculate each image height based column width and aspect ratio
      const { width, height } = this.images[i];
      const aRatio = height / width;
      const imgHeight = aRatio * imgWidth;

      // apply position styles
      const imgItem = this.imgItems[i];

      imgItem.style.height = `${imgHeight}px`;
      imgItem.style.width = `${imgWidth}px`;
      imgItem.style.top = `${colHeights[col]}px`;
      imgItem.style.left = `${(imgWidth + spacing) * col}px`;

      colHeights[col] += imgHeight + spacing;
      // move to next col
      col = nextCol;
      // next image
      i++;
    }

    this.gridContainer.style.height = `${Math.max(...colHeights) - spacing}px`;
    this.gridContainer.style.width = `${containerWidth}px`;
  }
}

export default function (...args) {
  return new PhotoGrid(...args);
}
