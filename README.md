# quark

**quark** is a minimal, efficient alternative to React, designed to simplify state management and UI rendering without the overhead of excessive features. Inspired by React’s declarative approach but focused solely on essential functionality, **quark** is a lightweight library that keeps things simple, making it ideal for smaller projects and game development.

React's logo resembles a proton, so **quark** takes its name from the subatomic particles that make up protons.

## Features

- **Lightweight**: Just 77 lines of code.
- **Simple State Management**: Manage component state without hooks.
- **Direct DOM Manipulation**: No virtual DOM—re-renders are handled by fully redrawing necessary parts of the DOM.
- **Functional Components**: Use declarative, functional components with a straightforward syntax.

## Installation

Just copy `quark.ts` into your project. There are no dependencies—**quark** is designed to be as lean as possible.

## Usage

Here’s a quick example to get started with **quark**:

```typescript
import React from "./quark.ts";  // Import quark as React

// Fetching data function
async function getData(url: string) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (e) {
    return { state: "error", data: e };
  }
}

// example using properties
function If(props:{condition: boolean, children: any[]}) {
  if (props.condition) {
    return <>
    {/*build the returnable elements*/}
    {...props.children}
    </>
  } else {
    return <></>
  }
}

// App component
function App() {
  const [counter, setCounter] = React.useState(0);
  const [pokemon, setPokemon] = React.useState({ state: "loading", data: null }); // State to hold the pokemon data

  // Fetch data if not already loaded
  if (pokemon.state === "loading") { // Check if still loading
    getData("https://pokeapi.co/api/v2/pokemon/ditto")
      .then((data) => {
        setPokemon({ state: "done", data: data }); // Update state when data is fetched
      })
      .catch((error) => {
        setPokemon({ state: "error", data: error }); // Handle errors
      });
  }
  // this will cause default react to yell and crash at you,
  // due to the dumb rule that it requires className and not class,
  // react-zero on the other hand, lets you do whatever the fuck you want
  // react-zero uses tsx/jsx just so you can write html in javascript
  return (
    <div class="app">
      <div>hi</div>
      <button onClick={() => setCounter(counter + 1)}>count: {counter}</button>
      <If condition={counter >= 4}>
        <div>
          {pokemon.state === "done" ? (
            <div>
              <div>name: {pokemon.data.name}</div>
              <img src={pokemon.data.sprites.front_shiny} alt="Pokemon" />
            </div>
          ) : pokemon.state === "error" ? (
            <div>error: {pokemon.data}</div>
          ) : (
            "loading..."
          )}
        </div>
      </If>
    </div>
  );
}

const root = document.getElementById("root");  // Get the root div element
React.render(App, root);  // Render the component


```
what it should look like when rendered:

![render example](images/example%20image.png)

## How It Works

- **State**: Use `useState` for state management without complex hooks. **quark** handles re-renders by redrawing the DOM when state changes.
- **Components**: Create functional components that return HTML elements or other components.
- **Rendering**: Uses a `render` function to clear and redraw the DOM efficiently, avoiding virtual DOM complexity.

## Contributing

Feel free to fork this repo and open a pull request with any improvements or features that stay true to **quark**’s minimalist approach.

## License

MIT License

---

**quark** is built for developers who want simplicity without sacrificing functionality. Enjoy building fast, lightweight apps!
