!function(){"use strict";var e,t={249:function(){var e=window.wp.blocks,t=window.wp.element,n=window.wp.i18n,r=window.wp.blockEditor,o=window.wp.components,c=window.lodash,l=window.wp.data;function i(){return i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},i.apply(this,arguments)}(0,e.registerBlockType)("wcb/section",{attributes:{uniqueId:{type:"string",default:""},column:{type:"number",default:2}},edit:function(e){const l=(0,r.useBlockProps)(),[i,a]=(0,t.useState)(2);return(0,t.createElement)("div",l,(0,t.createElement)(r.InspectorControls,null,(0,t.createElement)(o.PanelBody,{title:(0,n.__)("General Settings","wcb")},(0,t.createElement)(o.RangeControl,{label:(0,n.__)("Columns","wcb"),value:i,onChange:e=>a(e),min:1,max:6}))),(0,t.createElement)("div",{className:"wcb-section-wrapper"},(0,t.createElement)(r.InnerBlocks,{template:(0,c.times)(parseInt(i),(()=>["wcb/column"])),allowedBlocks:["wcb/column"],templateLock:"all",orientation:"horizontal",renderAppender:!1})))},save:function(e){let{attributes:n}=e;return(0,t.createElement)("div",i({},r.useBlockProps.save(),{className:"wcb-block-wrapper",id:`wcb-${n.uniqueId}`}),"Section Block")}});(0,e.registerBlockType)("wcb/column",{attributes:{uniqueId:{type:"string",default:""}},parent:["wcb/section"],supports:{inserter:!1,reusable:!1,html:!1},edit:function(e){(0,r.useBlockProps)();const{clientId:n}=e,{getBlockOrder:o,getBlockRootClientId:c,getBlockAttributes:i}=(0,l.select)("core/block-editor"),a=o(n).length>0;return(0,t.createElement)(t.Fragment,null,(0,t.createElement)(r.InnerBlocks,{templateLock:!1,template:[],renderAppender:a?void 0:()=>(0,t.createElement)(r.InnerBlocks.ButtonBlockAppender,null)}))},save:function(e){let{attributes:n}=e;return(0,t.createElement)("div",i({},r.useBlockProps.save(),{className:"wcb-block-wrapper",id:`wcb-${n.uniqueId}`}),"Column Block")}})}},n={};function r(e){var o=n[e];if(void 0!==o)return o.exports;var c=n[e]={exports:{}};return t[e](c,c.exports,r),c.exports}r.m=t,e=[],r.O=function(t,n,o,c){if(!n){var l=1/0;for(u=0;u<e.length;u++){n=e[u][0],o=e[u][1],c=e[u][2];for(var i=!0,a=0;a<n.length;a++)(!1&c||l>=c)&&Object.keys(r.O).every((function(e){return r.O[e](n[a])}))?n.splice(a--,1):(i=!1,c<l&&(l=c));if(i){e.splice(u--,1);var s=o();void 0!==s&&(t=s)}}return t}c=c||0;for(var u=e.length;u>0&&e[u-1][2]>c;u--)e[u]=e[u-1];e[u]=[n,o,c]},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},function(){var e={346:0,812:0};r.O.j=function(t){return 0===e[t]};var t=function(t,n){var o,c,l=n[0],i=n[1],a=n[2],s=0;if(l.some((function(t){return 0!==e[t]}))){for(o in i)r.o(i,o)&&(r.m[o]=i[o]);if(a)var u=a(r)}for(t&&t(n);s<l.length;s++)c=l[s],r.o(e,c)&&e[c]&&e[c][0](),e[c]=0;return r.O(u)},n=self.webpackChunkwoostify_conversion_blocks=self.webpackChunkwoostify_conversion_blocks||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))}();var o=r.O(void 0,[812],(function(){return r(249)}));o=r.O(o)}();