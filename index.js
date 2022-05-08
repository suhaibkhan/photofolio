const images = [
  "_DSC2279.jpg",
  "_DSC2225.jpg",
  "_DSC2277.jpg",
  "_DSC2224.jpg",
  "_DSC2198.jpg",
  "_DSC2180.jpg",
  "_DSC2148.jpg",
  "_DSC2086.jpg",
  "_DSC2083.jpg",
  "_DSC2059.jpg",
  "_DSC2045.jpg",

  "_DSC1364.jpg",
  "_DSC1360.jpg",
  "_DSC1356.jpg",
  "_DSC1341.jpg",
  "_DSC1144.jpg",
  "_DSC1139.jpg",
  "_DSC1077.jpg",
  "_DSC0955.jpg",
  "_DSC0931.jpg",
  "_DSC0903.jpg",
  "_DSC0842.jpg",
  "_DSC0812.jpg",
  "_DSC0791.jpg",
  "_DSC0777.jpg",
  "_DSC0528.jpg",
  "_DSC0519.jpg",
];

var imagesObjs = [
  { name: "_DSC2279.jpg", height: 1225, width: 1837, tags: ["georgia", "landscape", "mountains"] },
  { name: "_DSC2225.jpg", height: 1121, width: 1813, tags: ["georgia", "landscape", "mountains"] },
  { name: "_DSC2277.jpg", height: 1213, width: 1776, tags: ["georgia", "landscape", "mountains"] },
  { name: "_DSC2224.jpg", height: 1227, width: 1840, tags: ["georgia", "landscape", "mountains"] },
  { name: "_DSC2198.jpg", height: 1782, width: 1191, tags: ["georgia", "landscape"] },
  { name: "_DSC2180.jpg", height: 1211, width: 1794, tags: ["georgia", "landscape", "mountains"] },
  { name: "_DSC2148.jpg", height: 1202, width: 1802, tags: ["georgia", "cityscapes"] },
  { name: "_DSC2086.jpg", height: 1211, width: 1629, tags: ["georgia"] },
  { name: "_DSC2083.jpg", height: 1173, width: 1754, tags: ["georgia"] },
  { name: "_DSC2059.jpg", height: 1210, width: 1815, tags: ["georgia"] },
  { name: "_DSC2045.jpg", height: 1227, width: 1227, tags: ["georgia"] },
  { name: "_DSC0842.jpg", height: 1212, width: 1818, tags: ["dubai", "cityscapes"] },
  { name: "_DSC1341.jpg", height: 1096, width: 1840, tags: ["dubai", "cityscapes"] },
  { name: "_DSC1144.jpg", height: 1227, width: 1742, tags: ["dubai", "cityscapes"] },
  { name: "_DSC1139.jpg", height: 1112, width: 1112, tags: ["dubai", "cityscapes"] },
  { name: "_DSC1077.jpg", height: 1095, width: 1800, tags: ["sharjah", "cityscapes"] },
  { name: "_DSC0955.jpg", height: 1533, width: 1227, tags: ["sharjah"] },
  { name: "_DSC0931.jpg", height: 1727, width: 1152, tags: ["sharjah"] },
  { name: "_DSC0903.jpg", height: 1840, width: 1227, tags: ["sharjah"] },
  { name: "_DSC0812.jpg", height: 2264, width: 1483, tags: ["dubai", "cityscapes"] },
  { name: "_DSC0791.jpg", height: 1166, width: 1840, tags: ["dubai", "cityscapes"] },
  { name: "_DSC0777.jpg", height: 1371, width: 2085, tags: ["dubai", "cityscapes"] },
  { name: "_DSC0528.jpg", height: 1149, width: 919, tags: ["sharjah"] },
  { name: "_DSC0519.jpg", height: 1917, width: 1533, tags: ["dubai", "landscape", "mountains"] },
  { name: "_DSC1364.jpg", height: 1227, width: 1840, tags: ["dubai", "street"] },
  { name: "_DSC1360.jpg", height: 1138, width: 1544, tags: ["dubai", "street"] },
  { name: "_DSC1356.jpg", height: 1227, width: 1840, tags: ["dubai", "street"] },
];

function renderImages(tag) {
  var allImages = "";
  imagesObjs.forEach(function (img) {
    if (!tag || img.tags.indexOf(tag) >= 0) {
      allImages += '<img loading="lazy" src="images/photos/' + img.name + '" alt="' + img.name + '">';
    }
  });
  $("#photos").html(allImages);

  $("#photos img").click(function () {
    const src = $(this).attr("src");
    const w = $(this).width();
    const h = $(this).height();
    let landScape = true;
    if (w - h <= 0) {
      landScape = false;
    }
    showPhotoView(src, landScape);
  });
}

function hidePhotoView() {
  $("#photoview").hide();
  $("#photoviewimg").attr("src", "");
  $("#photoviewimg").removeClass("potraight");
  $("#photoviewimg").removeClass("landscape");
  // $("#pvcontainer").removeClass("fullscreen");
}

function showPhotoView(src, landScape) {
  $("#photoviewimg").attr("src", src);
  $("#photoviewimg").addClass(landScape ? "landscape" : "potraight");
  $("#photoview").show();
}

$(function () {

  renderImages();

  $("#closebtn").click(function () {
    hidePhotoView();
  });

  $("#photoviewimg").click(function () {
    $("#pvcontainer").toggleClass("fullscreen");
  });

  $('#tags a').click(function () {
    const tag = $(this).attr('data-tag');
    renderImages(tag);
  });
});
