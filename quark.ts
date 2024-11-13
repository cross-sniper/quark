let states: any[] = []; // Global state storage
let setStateCallback: (() => void) | null = null; // Callback for re-rendering
let stateId = 0; // Used to track state slots
export const __TYPE__ = "quark - reactjs without bullshit";
export function jsx(type: any, props: any, ...children: any[]) {

  if (typeof type === "function") {
    props.children = children;
    return type(props); // Execute component and return the result
  }

  const domElem = type === "Fragment" ? document.createDocumentFragment() : document.createElement(type);

  // Handle properties (attributes and event listeners)
  for (const prop in props) {
    if (prop === "children") continue;

    if (prop.startsWith("on")) {
      const eventName = prop.substring(2).toLowerCase();
      domElem.addEventListener(eventName, props[prop]);
    } else {
      domElem.setAttribute(prop, props[prop]);
    }
  }

  // Append children
  children.forEach(child => {
    if (typeof child === "string" || typeof child === "number") {
      domElem.appendChild(document.createTextNode(child.toString()));
    } else if (child instanceof Node) {
      domElem.appendChild(child);
    }
  });

  return domElem;
}

export const Fragment = "Fragment";

// Improved useState with re-rendering support
function useState(initialState?: any) {
  const vId = stateId++; // Unique ID for each state

  // Initialize state if it hasn't been set yet
  if (typeof states[vId] === "undefined") {
    states[vId] = initialState;
  }

  const setState = (newState: any) => {
    states[vId] = typeof newState === "function" ? newState(states[vId]) : newState;

    if (setStateCallback) setStateCallback(); // Trigger re-render
  };

  return [states[vId], setState];
}

// Function to trigger re-rendering
function render(Component: any, root: HTMLElement) {
  setStateCallback = () => {
    stateId = 0; // Reset ID for the new render
    root.innerHTML = ""; // Clear the current DOM
    root.appendChild(Component()); // Re-render with the new state
  };

  root.appendChild(Component()); // Initial render
}

// Export as default object
export default {
  createElement: jsx,
  Fragment,
  useState,
  render
};
