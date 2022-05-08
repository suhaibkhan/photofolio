const images = [
  "_DSC0519.jpg",
  "_DSC0528.jpg",
  "_DSC0777.jpg",
  "_DSC0791.jpg",
  "_DSC0812.jpg",
  "_DSC0842.jpg",
  "_DSC0903.jpg",
  "_DSC0931.jpg",
  "_DSC0955.jpg",
  "_DSC1077.jpg",
  "_DSC1139.jpg",
  "_DSC1144.jpg",
  "_DSC1341.jpg",
  "_DSC1356.jpg",
  "_DSC1360.jpg",
  "_DSC1364.jpg",
  "_DSC2045.jpg",
  "_DSC2059.jpg",
  "_DSC2083.jpg",
  "_DSC2086.jpg",
  "_DSC2148.jpg",
  "_DSC2180.jpg",
  "_DSC2198.jpg",
  "_DSC2224.jpg",
  "_DSC2225.jpg",
  "_DSC2277.jpg",
  "DSC2279.jpg",
];

function getRandomSize(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

var allImages = "";
images.reverse().forEach(function (img) {
  allImages += '<img src="images/photos/' + img + '" alt="' + img + '">';
});

// for (var i = 0; i < 25; i++) {
//   var width = getRandomSize(200, 400);
//   var height =  getRandomSize(200, 400);
//   allImages += '<img src="images/photos/" alt="pretty kitty">';
// }

function hidePhotoView() {
  $("#photoview").hide();
  $("#photoviewimg").attr("src", "");
  $("#photoviewimg").removeClass("potraight");
  $("#photoviewimg").removeClass("landscape");
  $("#pvcontainer").removeClass("fullscreen");
}

function showPhotoView(src, landScape) {
  $("#photoviewimg").attr("src", src);
  $("#photoviewimg").addClass(landScape ? "landscape" : "potraight");
  $("#photoview").show();
}

$(function () {
  $("#photos").append(allImages);

  $("#photos img").click(function () {
    const src = $(this).attr("src");
    const w = $(this).width();
    const h = $(this).height();
    let landScape = true;
    if (w - h < 0) {
      landScape = false;
    }
    showPhotoView(src, landScape);
  });

  $("#closebtn").click(function () {
    hidePhotoView();
  });

  $("#photoviewimg").click(function () {
    $("#pvcontainer").toggleClass("fullscreen");
  });
});
