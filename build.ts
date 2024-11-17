import {build} from "vite"

// TODO: make this retarded lib only include my tsx files and quark, nothing else
/*
❯ original cat dist/assets/index-DPfM1zgE.js
true&&(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload"))
    return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]'))
    processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList")
        continue;
      for (const node of mutation.addedNodes)
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
    }
  }).observe(document, { childList: !0, subtree: !0 });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = !0;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
}());
// this is where quark begins and my actual code, everything above is is not needed and should be nuked out
...
*/
build({
	build: {
		target: "esnext",
		assetsInlineLimit: 0,
		emptyOutDir: true,

		rollupOptions: {
			input: {
				index: "index.html"
			},
		},
		minify: false,
		legacy: false,
		polyfillModulePreload: false,
		modulePreload:{polyfill: false}
	},
	
	// Configure JSX/TSX for Quark
	esbuild: {
		jsxFactory: 'Quark.createElement',  // Use Quark's JSX factory method
		jsxFragment: 'Quark.Fragment',  // Use Quark's JSX fragment method
	},
})
