/*
everything in here is by-spec of quark
if someone tries to tell it is wrong, they are fucking retards that know nothing about quark
  - cross(the guy that wrote quark)

quark is just a reverse-engineered(esbuild), speed-focused(for games and whatnot) version of React
  - cross


*************************************************
* SPA(Single Page Application) example in Quark *
*             written by: cross                 *
*************************************************
*/

import React from "./quark.ts";  // Import quark instead of React
// if you want just the render function, "import {render} from './quark.ts';"
import "./style.css";

function LinkHandler(attrs:{children: HTMLElement[], setPage: (arg0: string | undefined) => void})
{
  let children = attrs.children
  for(let child of children)
  {
    // if the child is a link, and has a href that points to "/<page>" then set the onClick to handle to that page
    if(child.tagName == "A")
    {
      child.classList.add("link")
      if(child.getAttribute("href"))
      {
        let href = child.getAttribute("href")
        if(href?.startsWith("http") || href?.startsWith("https"))
          continue// don't do anything, since this leads out of the app
        // Attach onclick handler to update the page state and prevent default behavior
        child.onclick = (event) => {
          event.preventDefault();  // Prevent normal link navigation
          const page = href?.substring(1);  // Get page name from href, removing the "/"
          attrs.setPage(page);
          child.setAttribute("href", "#");  // Disable default link behavior
          child.setAttribute("target", "about:blank");
          child.setAttribute("rel", "about:blank");
        };
      }
    }
  }

 return (<>{...children}</>) 
}

function App(){
  const [page, setPage] = React.useState("home");
  return (
    <div>
      <h1>Nexus</h1>
      {/*
        if your lsp complains about missing attribute: children,
        just don't bother with it, it is a false error.
        This will work regardless of your lsp's opinions
      */}
      <LinkHandler setPage={setPage}>
        <div>
        {/*
        here you can handle the pages, if you want to,
        For now just echo the name back
        */}
        {page}
        </div>
        <a href="/home">Home</a>
        <br/>
        <a href="/about">About</a>
      </LinkHandler>
    </div>
  )
}


const root = document.getElementById("root");  // Get the root div element
React.render(App, root!);  // Render the component
