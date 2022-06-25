import './styles/main.css';

import {
  ready,
  load,
  selectById,
  onClick,
  addClass,
  removeClass,
} from './utils';
import { images } from './image-data';
import photoGrid from './photo-grid';
import photoViewer from './photo-viewer';

let sideNav = null;
let mobileHeader = null;

load(() => {
  selectById('curYear').innerText = new Date().getFullYear();

  const viewer = photoViewer(selectById('image-view'), images, {
    spacing: 20,
    titleHolder: 'image-titles'
  });

  const grid = photoGrid(selectById('image-grid'), images, {
    spacing: 10,
    columns: [
      { maxWidth: 800, count: 2 },
      { maxWidth: 1400, count: 3 },
    ],
    onImageClick: (image, imgIdx, imgElem) => {
      viewer.open(imgIdx, imgElem);
    },
  });

  // filter based on url
  const locHash = window.location.hash;
  if (locHash) {
    const navLinks = selectById('navList').getElementsByTagName('a');
    const activeLink = Array.prototype.find.call(
      navLinks,
      (link) => link.getAttribute('href') === locHash
    );
    if (activeLink) {
      activateNavLink(activeLink);
    }
    filterImages(grid, viewer, locHash.slice(1));
  }

  onClick(selectById('navList').getElementsByTagName('a'), (event) => {
    const tagVal = event.target && event.target.getAttribute('href').slice(1);
    activateNavLink(event.target);
    filterImages(grid, viewer, tagVal);
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

function activateNavLink(newLink) {
  const newActiveLi = newLink.parentNode;

  const liItems = selectById('navList').getElementsByTagName('li');
  Array.prototype.forEach.call(liItems, (item) => {
    removeClass(item, 'active');
  });

  addClass(newActiveLi, 'active');
}

function filterImages(grid, viewer, tagVal) {
  const filteredImages = images.filter((img) => !tagVal || img.tags.indexOf(tagVal) >= 0);
  grid.updateImages(filteredImages);
  viewer.updateImages(filteredImages);
}
