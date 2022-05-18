(()=>{"use strict";function t(t){return document.getElementById(t)}function e(t,e){t&&t.nodeType&&1===t.nodeType?t.addEventListener("click",e):Array.prototype.forEach.call(t,(function(t){t.addEventListener("click",e)}))}function i(t,e){var i=t.getAttribute("class");if(!(i&&i.split(" ").indexOf(e)>=0)){var n=e;i&&(n=i+" "+n),t.setAttribute("class",n)}}function n(t,e){var i=t.getAttribute("class");if(i&&-1!==i.split(" ").indexOf(e)){var n="";i&&(n=i.split(" ").filter((function(t){return t!==e})).join(" ")),t.setAttribute("class",n)}}function a(t){var e=getComputedStyle(t);return t.clientWidth-(parseFloat(e.paddingLeft)+parseFloat(e.paddingRight))}var r=[{name:"_DSC2279.jpg",height:1225,width:1837,tags:["georgia","landscape","mountains"]},{name:"_DSC2225.jpg",height:1121,width:1813,tags:["georgia","landscape","mountains"]},{name:"_DSC2277.jpg",height:1213,width:1776,tags:["georgia","landscape","mountains"]},{name:"_DSC2224.jpg",height:1227,width:1840,tags:["georgia","landscape","mountains"]},{name:"_DSC2198.jpg",height:1782,width:1191,tags:["georgia","landscape"]},{name:"_DSC2180.jpg",height:1211,width:1794,tags:["georgia","landscape","mountains"]},{name:"_DSC2148.jpg",height:1202,width:1802,tags:["georgia","cityscapes"]},{name:"_DSC2086.jpg",height:1211,width:1629,tags:["georgia"]},{name:"_DSC2083.jpg",height:1173,width:1754,tags:["georgia"]},{name:"_DSC2059.jpg",height:1210,width:1815,tags:["georgia"]},{name:"_DSC2045.jpg",height:1227,width:1227,tags:["georgia"]},{name:"_DSC0842.jpg",height:1212,width:1818,tags:["dubai","cityscapes"]},{name:"_DSC1341.jpg",height:1096,width:1840,tags:["dubai","cityscapes"]},{name:"_DSC1144.jpg",height:1227,width:1742,tags:["dubai","cityscapes"]},{name:"_DSC1139.jpg",height:1112,width:1112,tags:["dubai","cityscapes"]},{name:"_DSC1077.jpg",height:1095,width:1800,tags:["sharjah","cityscapes"]},{name:"_DSC0955.jpg",height:1533,width:1227,tags:["sharjah"]},{name:"_DSC0931.jpg",height:1727,width:1152,tags:["sharjah"]},{name:"_DSC0903.jpg",height:1840,width:1227,tags:["sharjah"]},{name:"_DSC0812.jpg",height:2264,width:1483,tags:["dubai","cityscapes"]},{name:"_DSC0791.jpg",height:1166,width:1840,tags:["dubai","cityscapes"]},{name:"_DSC0777.jpg",height:1371,width:2085,tags:["dubai","cityscapes"]},{name:"_DSC0528.jpg",height:1149,width:919,tags:["sharjah"]},{name:"_DSC0519.jpg",height:1917,width:1533,tags:["dubai","landscape","mountains"]},{name:"_DSC1364.jpg",height:1227,width:1840,tags:["dubai"]},{name:"_DSC1360.jpg",height:1138,width:1544,tags:["dubai"]},{name:"_DSC1356.jpg",height:1227,width:1840,tags:["dubai"]}];function o(t,e,i){return o=s()?Reflect.construct:function(t,e,i){var n=[null];n.push.apply(n,e);var a=new(Function.bind.apply(t,n));return i&&c(a,i.prototype),a},o.apply(null,arguments)}function s(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}function c(t,e){return c=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},c(t,e)}function l(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,n=new Array(e);i<e;i++)n[i]=t[i];return n}function u(t,e){var i=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),i.push.apply(i,n)}return i}function h(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function g(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var p=function(){function t(e,i,n){var a=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.container=e,this.allImages=i,this.images=i,this.options=function(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{};e%2?u(Object(i),!0).forEach((function(e){h(t,e,i[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(i)):u(Object(i)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(i,e))}))}return t}({imgPathPrefix:"images/photos/",spacing:0,columns:[{maxWidth:600,count:2},{maxWidth:1200,count:3}],onImageClick:function(t,e){}},n),Array.isArray(this.options.columns)&&this.options.columns.sort((function(t,e){return+e.maxWidth-+t.maxWidth})),this.imageObserver=new IntersectionObserver((function(t,e){t.forEach((function(t){if(t.isIntersecting){var e=t.target,i=e.getAttribute("data-src");e.setAttribute("src",i),a.imageObserver.unobserve(e)}}))})),this.imgItems=[],this.addImages();var r=null;window.addEventListener("resize",(function(){clearTimeout(r),r=setTimeout((function(){a.positionImages()}),50)}),!0)}var e,i;return e=t,(i=[{key:"getColumns",value:function(){if("number"==typeof this.options.columns)return this.options.columns;if(Array.isArray(this.options.columns)&&this.options.columns.length>0){var t=window.innerWidth,e=this.options.columns.filter((function(e){return+e.maxWidth<=t}));if(e.length>0)return e[0].count}return 1}},{key:"filterImages",value:function(t){this.images=this.allImages.filter(t),this.addImages()}},{key:"addImages",value:function(){var t=this,e=this.options.imgPathPrefix;this.container.innerHTML="",this.imgItems=[],this.gridContainer=document.createElement("div"),this.gridContainer.setAttribute("class","pg-image-grid");var i=this.options.onImageClick;this.images.forEach((function(n){var a=document.createElement("div");a.setAttribute("class","pg-image-item");var r=document.createElement("img");r.setAttribute("data-src",e+n.name),a.appendChild(r),a.addEventListener("click",(function(t){i&&i(n,r,t)})),t.imgItems.push(a),t.imageObserver.observe(r),t.gridContainer.appendChild(a)})),this.positionImages(),this.container.appendChild(this.gridContainer)}},{key:"positionImages",value:function(){for(var t=this.options.spacing,e=this.getColumns(),i=t*(e-1),n=a(this.container),r=(n-i)/e,o=Array(e).fill(0),s=0,c=0;s<this.images.length;){var u=(c+1)%e;if(o[c]>o[u])c=u;else{var h=this.images[s],g=h.width,p=h.height/g*r,m=this.imgItems[s];m.style.height="".concat(p,"px"),m.style.width="".concat(r,"px"),m.style.top="".concat(o[c],"px"),m.style.left="".concat((r+t)*c,"px"),o[c]+=p+t,c=u,s++}}var d;this.gridContainer.style.height="".concat(Math.max.apply(Math,function(t){if(Array.isArray(t))return l(t)}(d=o)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(d)||function(t,e){if(t){if("string"==typeof t)return l(t,e);var i=Object.prototype.toString.call(t).slice(8,-1);return"Object"===i&&t.constructor&&(i=t.constructor.name),"Map"===i||"Set"===i?Array.from(t):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?l(t,e):void 0}}(d)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}())-t,"px"),this.gridContainer.style.width="".concat(n,"px")}}])&&g(e.prototype,i),Object.defineProperty(e,"prototype",{writable:!1}),t}();function m(t,e,i){return m=d()?Reflect.construct:function(t,e,i){var n=[null];n.push.apply(n,e);var a=new(Function.bind.apply(t,n));return i&&f(a,i.prototype),a},m.apply(null,arguments)}function d(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}function f(t,e){return f=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},f(t,e)}function y(t,e){var i=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),i.push.apply(i,n)}return i}function v(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function b(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var w,j=function(){function e(i,n){var a=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),this.container=i,this.image=null,this.imgElem=null,this.imgParent=null,this.titleElem=null,this.options=function(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{};e%2?y(Object(i),!0).forEach((function(e){v(t,e,i[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(i)):y(Object(i)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(i,e))}))}return t}({spacing:0,animate:!0,showTitle:!0,titleHolder:null},n),this.titleHolder=this.options.titleHolder?t(this.options.titleHolder):null,this.init();var r=null;window.addEventListener("resize",(function(){clearTimeout(r),r=setTimeout((function(){a.positionImage()}),50)}),!0)}var n,r;return n=e,(r=[{key:"init",value:function(){i(this.container,"pv-container"),this.imgParent=document.createElement("div");var t=["pv-image-container"];this.options.animate&&t.push("pv-animate"),this.imgParent.setAttribute("class",t.join(" ")),this.imgElem=document.createElement("img"),this.imgParent.appendChild(this.imgElem),this.container.appendChild(this.imgParent),this.setupToolbar(),this.options.showTitle&&(this.titleElem=document.createElement("div"),this.titleElem.setAttribute("class","pv-title"),this.container.appendChild(this.titleElem))}},{key:"setupToolbar",value:function(){var t=this,e=document.createElement("div");e.setAttribute("class","pv-toolbar");var i=document.createElement("span");i.setAttribute("class","material-symbols-outlined"),i.innerText="close";var n=document.createElement("span");n.setAttribute("class","material-symbols-outlined"),n.innerText="fullscreen",e.appendChild(i),this.container.appendChild(e),i.addEventListener("click",(function(){t.close()}))}},{key:"open",value:function(t,e){if(this.options.animate){var i=e.getBoundingClientRect(),n=i.x,a=i.y,r=i.width,o=i.height;this.imgParent.style.width="".concat(r,"px"),this.imgParent.style.height="".concat(o,"px"),this.imgParent.style.top="".concat(a,"px"),this.imgParent.style.left="".concat(n,"px")}if(this.image=t,this.container.style.display="block",this.imgElem.setAttribute("src",e.getAttribute("src")),this.titleElem){var s=t.title;if(this.titleHolder){var c=this.titleHolder.querySelector('div[data-img="'.concat(t.name,'"]'));c&&c.innerHTML&&(s=c.innerHTML)}this.titleElem.innerHTML=s||"",this.titleElem.style.display=s?"block":"none"}this.positionImage()}},{key:"close",value:function(){this.container.style.display="none",this.imgElem.removeAttribute("src")}},{key:"positionImage",value:function(){var t,e,i=this.options.spacing,n=this.titleElem?this.titleElem.clientHeight:0,r=a(this.container)-2*i,o=(t=this.container,e=getComputedStyle(t),t.clientHeight-(parseFloat(e.paddingTop)+parseFloat(e.paddingBottom))-2*i-n),s=r>=o,c=this.image.height/this.image.width,l=s?o/c:r,u=s?o:r*c;if(u>o&&(l=(u=o)/c),l>r&&(u=(l=r)*c),this.imgParent.style.width="".concat(l,"px"),this.imgParent.style.height="".concat(u,"px"),this.imgParent.style.top="".concat((o-u)/2+i,"px"),this.imgParent.style.left="".concat((r-l)/2+i,"px"),this.titleElem){var h=u+parseFloat(this.imgParent.style.top);this.titleElem.style.top="".concat(h,"px")}}}])&&b(n.prototype,r),Object.defineProperty(n,"prototype",{writable:!1}),e}(),O=null,C=null;function E(){O&&C&&(i(O,"show"),i(C,"opennav"))}function P(){O&&C&&(n(O,"show"),n(C,"opennav"))}function S(e){var a=e.parentNode,r=t("navList").getElementsByTagName("li");Array.prototype.forEach.call(r,(function(t){n(t,"active")})),i(a,"active")}function D(t,e){t.filterImages((function(t){return!e||t.tags.indexOf(e)>=0}))}w=function(){t("curYear").innerText=(new Date).getFullYear();var i=function(){for(var t=arguments.length,e=new Array(t),i=0;i<t;i++)e[i]=arguments[i];return m(j,e)}(t("image-view"),{spacing:20,titleHolder:"image-titles"}),n=function(){for(var t=arguments.length,e=new Array(t),i=0;i<t;i++)e[i]=arguments[i];return o(p,e)}(t("image-grid"),r,{spacing:10,columns:[{maxWidth:800,count:2},{maxWidth:1400,count:3}],onImageClick:function(t,e){i.open(t,e)}}),a=window.location.hash;if(a){var s=t("navList").getElementsByTagName("a"),c=Array.prototype.find.call(s,(function(t){return t.getAttribute("href")===a}));c&&S(c),D(n,a.slice(1))}e(t("navList").getElementsByTagName("a"),(function(t){var e=t.target&&t.target.getAttribute("href").slice(1);S(t.target),D(n,e),P()})),O=t("sidenav"),C=t("mobile-header"),e(t("menu-btn"),E),e(t("back-btn"),P);var l=null;window.addEventListener("resize",(function(){clearTimeout(l),l=setTimeout((function(){P()}),500)}),!0)},"loading"!=document.readyState?w():document.addEventListener?document.addEventListener("DOMContentLoaded",w):document.attachEvent("onreadystatechange",(function(){"complete"==document.readyState&&w()}))})();