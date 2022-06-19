(()=>{"use strict";function t(t){return document.getElementById(t)}function e(t,e){t&&t.nodeType&&1===t.nodeType?t.addEventListener("click",e):Array.prototype.forEach.call(t,(function(t){t.addEventListener("click",e)}))}function i(t,e){var i=t.getAttribute("class");if(!(i&&i.split(" ").indexOf(e)>=0)){var n=e;i&&(n=i+" "+n),t.setAttribute("class",n)}}function n(t,e){var i=t.getAttribute("class");if(i&&-1!==i.split(" ").indexOf(e)){var n="";i&&(n=i.split(" ").filter((function(t){return t!==e})).join(" ")),t.setAttribute("class",n)}}function a(t){var e=getComputedStyle(t);return t.clientWidth-(parseFloat(e.paddingLeft)+parseFloat(e.paddingRight))}var r=[{name:"_DSC2279.jpg",height:1225,width:1837,tags:["georgia","landscape","mountains"]},{name:"_DSC2225.jpg",height:1121,width:1813,tags:["georgia","landscape","mountains"]},{name:"_DSC2277.jpg",height:1213,width:1776,tags:["georgia","landscape","mountains"]},{name:"_DSC2224.jpg",height:1227,width:1840,tags:["georgia","landscape","mountains"]},{name:"_DSC2198.jpg",height:1782,width:1191,tags:["georgia","landscape"]},{name:"_DSC2180.jpg",height:1211,width:1794,tags:["georgia","landscape","mountains"]},{name:"_DSC2148.jpg",height:1202,width:1802,tags:["georgia","cityscapes"]},{name:"_DSC2083.jpg",height:1173,width:1754,tags:["georgia"]},{name:"_DSC2059.jpg",height:1210,width:1815,tags:["georgia"]},{name:"_DSC2045.jpg",height:1227,width:1227,tags:["georgia"]},{name:"_DSC0842.jpg",height:1212,width:1818,tags:["dubai","cityscapes"]},{name:"_DSC1341.jpg",height:1096,width:1840,tags:["dubai","cityscapes"]},{name:"_DSC1144.jpg",height:1227,width:1742,tags:["dubai","cityscapes"]},{name:"_DSC1139.jpg",height:1112,width:1112,tags:["dubai","cityscapes"]},{name:"_DSC1077.jpg",height:1095,width:1800,tags:["sharjah","cityscapes"]},{name:"_DSC0955.jpg",height:1533,width:1227,tags:["sharjah"]},{name:"_DSC0931.jpg",height:1727,width:1152,tags:["sharjah"]},{name:"_DSC0903.jpg",height:1840,width:1227,tags:["sharjah"]},{name:"_DSC0812.jpg",height:2264,width:1483,tags:["dubai","cityscapes"]},{name:"_DSC0791.jpg",height:1166,width:1840,tags:["dubai","cityscapes"]},{name:"_DSC0777.jpg",height:1371,width:2085,tags:["dubai","cityscapes"]},{name:"_DSC0528.jpg",height:1149,width:919,tags:["sharjah"]},{name:"_DSC0519.jpg",height:1917,width:1533,tags:["dubai","landscape","mountains"]},{name:"_DSC1364.jpg",height:1227,width:1840,tags:["dubai"]},{name:"_DSC1360.jpg",height:1138,width:1544,tags:["dubai"]},{name:"_DSC1356.jpg",height:1227,width:1840,tags:["dubai"]}];function s(t,e,i){return s=o()?Reflect.construct:function(t,e,i){var n=[null];n.push.apply(n,e);var a=new(Function.bind.apply(t,n));return i&&c(a,i.prototype),a},s.apply(null,arguments)}function o(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}function c(t,e){return c=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},c(t,e)}function l(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,n=new Array(e);i<e;i++)n[i]=t[i];return n}function h(t,e){var i=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),i.push.apply(i,n)}return i}function u(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function g(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var p=function(){function t(e,i,n){var a=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.container=e,this.allImages=i,this.images=i,this.options=function(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{};e%2?h(Object(i),!0).forEach((function(e){u(t,e,i[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(i)):h(Object(i)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(i,e))}))}return t}({imgPathPrefix:"images/photos/",spacing:0,columns:[{maxWidth:600,count:2},{maxWidth:1200,count:3}],onImageClick:function(t,e){}},n),Array.isArray(this.options.columns)&&this.options.columns.sort((function(t,e){return+e.maxWidth-+t.maxWidth})),this.imageObserver=new IntersectionObserver((function(t,e){t.forEach((function(t){if(t.isIntersecting){var e=t.target,i=e.getAttribute("data-src");e.setAttribute("src",i),a.imageObserver.unobserve(e)}}))})),this.imgItems=[],this.addImages();var r=null;window.addEventListener("resize",(function(){clearTimeout(r),r=setTimeout((function(){a.positionImages()}),50)}),!0)}var e,i;return e=t,(i=[{key:"getColumns",value:function(){if("number"==typeof this.options.columns)return this.options.columns;if(Array.isArray(this.options.columns)&&this.options.columns.length>0){var t=window.innerWidth,e=this.options.columns.filter((function(e){return+e.maxWidth<=t}));if(e.length>0)return e[0].count}return 1}},{key:"filterImages",value:function(t){this.images=this.allImages.filter(t),this.addImages()}},{key:"addImages",value:function(){var t=this,e=this.options.imgPathPrefix;this.container.innerHTML="",this.imgItems=[],this.gridContainer=document.createElement("div"),this.gridContainer.setAttribute("class","pg-image-grid");var i=this.options.onImageClick;this.images.forEach((function(n,a){var r=document.createElement("div");r.setAttribute("class","pg-image-item");var s=document.createElement("img");s.setAttribute("data-src",e+n.name),r.appendChild(s),r.addEventListener("click",(function(t){i&&i(n,a,s,t)})),t.imgItems.push(r),t.imageObserver.observe(s),t.gridContainer.appendChild(r)})),this.positionImages(),this.container.appendChild(this.gridContainer)}},{key:"positionImages",value:function(){for(var t=this.options.spacing,e=this.getColumns(),i=t*(e-1),n=a(this.container),r=(n-i)/e,s=Array(e).fill(0),o=0,c=0;o<this.images.length;){var h=(c+1)%e;if(s[c]>s[h])c=h;else{var u=this.images[o],g=u.width,p=u.height/g*r,m=this.imgItems[o];m.style.height="".concat(p,"px"),m.style.width="".concat(r,"px"),m.style.top="".concat(s[c],"px"),m.style.left="".concat((r+t)*c,"px"),s[c]+=p+t,c=h,o++}}var d;this.gridContainer.style.height="".concat(Math.max.apply(Math,function(t){if(Array.isArray(t))return l(t)}(d=s)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(d)||function(t,e){if(t){if("string"==typeof t)return l(t,e);var i=Object.prototype.toString.call(t).slice(8,-1);return"Object"===i&&t.constructor&&(i=t.constructor.name),"Map"===i||"Set"===i?Array.from(t):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?l(t,e):void 0}}(d)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}())-t,"px"),this.gridContainer.style.width="".concat(n,"px")}}])&&g(e.prototype,i),Object.defineProperty(e,"prototype",{writable:!1}),t}();function m(t,e,i){return m=d()?Reflect.construct:function(t,e,i){var n=[null];n.push.apply(n,e);var a=new(Function.bind.apply(t,n));return i&&f(a,i.prototype),a},m.apply(null,arguments)}function d(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}function f(t,e){return f=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},f(t,e)}function y(t,e){var i=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),i.push.apply(i,n)}return i}function v(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function b(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var w,j="pv-animate",O="disabled",E=function(){function e(i,n,a){var r=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),this.container=i,this.images=n,this.image=null,this.imageIdx=null,this.imgElem=null,this.imgParent=null,this.titleElem=null,this.nextBtn=null,this.prevBtn=null,this.viewerOpen=!1,this.options=function(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{};e%2?y(Object(i),!0).forEach((function(e){v(t,e,i[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(i)):y(Object(i)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(i,e))}))}return t}({imgPathPrefix:"images/photos/",spacing:0,animate:!0,showTitle:!0,titleHolder:null},a),this.titleHolder=this.options.titleHolder?t(this.options.titleHolder):null,this.init();var s=null;window.addEventListener("resize",(function(){clearTimeout(s),s=setTimeout((function(){r.positionImage()}),50)}),!0)}var r,s;return r=e,(s=[{key:"init",value:function(){var t=this;i(this.container,"pv-container"),this.imgParent=document.createElement("div");var e=["pv-image-container"];this.options.animate&&e.push(j),this.imgParent.setAttribute("class",e.join(" ")),this.imgElem=document.createElement("img"),this.imgParent.appendChild(this.imgElem),this.container.appendChild(this.imgParent),this.setupToolbar(),this.options.showTitle&&(this.titleElem=document.createElement("div"),this.titleElem.setAttribute("class","pv-title"),this.container.appendChild(this.titleElem)),document.body.addEventListener("keydown",(function(e){if(t.viewerOpen){var i=e.key;"ArrowUp"===i||"ArrowLeft"===i?(e.preventDefault(),t.navigate(!1)):"ArrowDown"!==i&&"ArrowRight"!==i||(e.preventDefault(),t.navigate(!0))}}))}},{key:"setupToolbar",value:function(){var t=this,e=document.createElement("div");e.setAttribute("class","pv-toolbar");var i=document.createElement("span");i.setAttribute("class","material-symbols-outlined"),i.innerHTML="&#xe5cd;";var n=document.createElement("span");n.setAttribute("class","spacer");var a=document.createElement("span");a.setAttribute("class","material-symbols-outlined"),a.innerHTML="&#xe316;",this.prevBtn=a;var r=document.createElement("span");r.setAttribute("class","material-symbols-outlined"),r.innerHTML="&#xe313;",this.nextBtn=r;var s=document.createElement("span");s.setAttribute("class","material-symbols-outlined"),s.innerText="fullscreen",e.appendChild(i),e.appendChild(n),e.appendChild(a),e.appendChild(r),this.container.appendChild(e),i.addEventListener("click",(function(){t.close()})),a.addEventListener("click",(function(){t.navigate(!1)})),r.addEventListener("click",(function(){t.navigate(!0)}))}},{key:"navigate",value:function(t){var e=this.imageIdx+(t?1:-1);e<0||e>=this.images.length||(this.titleElem.style.display="none",n(this.imgParent,j),this.open(e,null))}},{key:"updateNav",value:function(){0===this.imageIdx?i(this.prevBtn,O):n(this.prevBtn,O),this.imageIdx===this.images.length-1?i(this.nextBtn,O):n(this.nextBtn,O)}},{key:"open",value:function(t,e){var i=this.options,n=i.imgPathPrefix,a=i.animate;this.imageIdx=t,this.updateNav();var r=this.images[t];if(a&&e){var s=e.getBoundingClientRect(),o=s.x,c=s.y,l=s.width,h=s.height;this.imgParent.style.width="".concat(l,"px"),this.imgParent.style.height="".concat(h,"px"),this.imgParent.style.top="".concat(c,"px"),this.imgParent.style.left="".concat(o,"px")}if(this.image=r,this.container.style.display="block",this.imgElem.setAttribute("src",n+r.name),this.titleElem){var u=r.title;if(this.titleHolder){var g=this.titleHolder.querySelector('div[data-img="'.concat(r.name,'"]'));g&&g.innerHTML&&(u=g.innerHTML)}this.titleElem.innerHTML=u||"",this.titleElem.style.display=u?"block":"none"}this.positionImage(),this.viewerOpen=!0}},{key:"close",value:function(){this.viewerOpen=!1,this.container.style.display="none",this.imgElem.removeAttribute("src"),this.options.animate&&i(this.imgParent,j)}},{key:"positionImage",value:function(){var t,e,i=this.options.spacing,n=this.titleElem?this.titleElem.clientHeight:0,r=a(this.container)-2*i,s=(t=this.container,e=getComputedStyle(t),t.clientHeight-(parseFloat(e.paddingTop)+parseFloat(e.paddingBottom))-2*i-n),o=r>=s,c=this.image.height/this.image.width,l=o?s/c:r,h=o?s:r*c;if(h>s&&(l=(h=s)/c),l>r&&(h=(l=r)*c),this.imgParent.style.width="".concat(l,"px"),this.imgParent.style.height="".concat(h,"px"),this.imgParent.style.top="".concat((s-h)/2+i,"px"),this.imgParent.style.left="".concat((r-l)/2+i,"px"),this.titleElem){var u=h+parseFloat(this.imgParent.style.top);this.titleElem.style.top="".concat(u,"px")}}}])&&b(r.prototype,s),Object.defineProperty(r,"prototype",{writable:!1}),e}(),C=null,P=null;function x(){C&&P&&(i(C,"show"),i(P,"opennav"))}function A(){C&&P&&(n(C,"show"),n(P,"opennav"))}function D(e){var a=e.parentNode,r=t("navList").getElementsByTagName("li");Array.prototype.forEach.call(r,(function(t){n(t,"active")})),i(a,"active")}function S(t,e){t.filterImages((function(t){return!e||t.tags.indexOf(e)>=0}))}w=function(){t("curYear").innerText=(new Date).getFullYear();var i=function(){for(var t=arguments.length,e=new Array(t),i=0;i<t;i++)e[i]=arguments[i];return m(E,e)}(t("image-view"),r,{spacing:20,titleHolder:"image-titles"}),n=function(){for(var t=arguments.length,e=new Array(t),i=0;i<t;i++)e[i]=arguments[i];return s(p,e)}(t("image-grid"),r,{spacing:10,columns:[{maxWidth:800,count:2},{maxWidth:1400,count:3}],onImageClick:function(t,e,n){i.open(e,n)}}),a=window.location.hash;if(a){var o=t("navList").getElementsByTagName("a"),c=Array.prototype.find.call(o,(function(t){return t.getAttribute("href")===a}));c&&D(c),S(n,a.slice(1))}e(t("navList").getElementsByTagName("a"),(function(t){var e=t.target&&t.target.getAttribute("href").slice(1);D(t.target),S(n,e),A()})),C=t("sidenav"),P=t("mobile-header"),e(t("menu-btn"),x),e(t("back-btn"),A);var l=null;window.addEventListener("resize",(function(){clearTimeout(l),l=setTimeout((function(){A()}),500)}),!0)},window.addEventListener("load",w)})();