import './styles/main.css';

import { ready, selectById, onClick, addClass, removeClass } from './utils';
import { images } from './image-data';
import photoGrid from './photo-grid';
import photoViewer from './photo-viewer';

let sideNav = null;
let mobileHeader = null;

ready(() => {
  selectById('curYear').innerText = new Date().getFullYear();

  const viewer = photoViewer(selectById('image-view'));

  const grid = photoGrid(selectById('image-grid'), images, {
    spacing: 10,
    columns: [
      { maxWidth: 800, count: 2 },
      { maxWidth: 1400, count: 3 },
    ],
    onImageClick: (image, imgElem) => {
      viewer.open(image, imgElem);
    },
  });

  onClick(selectById('tags').childNodes, (event) => {
    const tagVal = event.target && event.target.getAttribute('data-tag');
    grid.filterImages((img) => !tagVal || img.tags.indexOf(tagVal) >= 0);
    hideSideNav();
  });

  sideNav = selectById('sidenav');
  mobileHeader = selectById('mobile-header');

  onClick(selectById('menu-btn'), showSideNav);
  onClick(selectById('back-btn'), hideSideNav);

  let resizeTimer = null;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // hide side menu on resize
        hideSideNav();
      }, 500);
    },
    true
  );
});

function showSideNav() {
  if (!sideNav || !mobileHeader) return;
  addClass(sideNav, 'show');
  addClass(mobileHeader, 'opennav');
}

function hideSideNav() {
  if (!sideNav || !mobileHeader) return;
  removeClass(sideNav, 'show');
  removeClass(mobileHeader, 'opennav');
}
