# react-testing-library

Examples of various testing patterns with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro). Written by Zach Schneider for a September 2020 talk at the [Cleveland React meetup](https://www.meetup.com/Cleveland-React/events/263066228).

## Setup

1. Clone the repository: `git clone https://github.com/schneidmaster/react-testing-library-talk.git`

2. Install dependencies: `yarn install`

3. To run the app locally: start the mock API with `yarn api`; in a separate terminal, start the React app with `yarn start`; and visit [http://localhost:3000](http://localhost:3000) in your browser

4. To run the tests: `yarn test`.

## Testing philosophy

I started off the talk with some general information and thoughts about react-testing-library, and then jumped into some live coding to produce the tests shown here. Here's a summary of the general information I covered.

### Some caveats

1. Tests are good, regardless of how they're written. Our codebase at Aha! has hundreds of tests that don't follow these practices, and I have no plans to rewrite them anytime soon. We have generally adopted react-testing-library for all new tests but most testing improvements are best done incrementally.
2. Enzyme is a fantastic tool and it was the gold standard for JS testing for several years. Enzyme tests still have significant value in any codebase, especially compared to no tests at all. I'm going to express some critical opinions about it later on, but I want to contextualize these ahead of time. We have much to be grateful to Enzyme for; it brought us a lot of value, and taught us lessons which we have now incorporated into even better tooling. My opinion is definitely not "Enzyme sucks and you should look down upon it." (If you don't know what Enzyme is, don't sweat it -- you don't really need to know anything about it to get value from the rest of the talk.)

### How does react-testing-library work?

It's refreshingly simple. It renders your component using JSDOM, which is a "real" DOM similar to what might run in a browser except implemented entirely in JavaScript. Then it gives you a set of helpers to interact with that DOM -- fetching components by text or label, clicking or typing, etc.

### react-testing-library guiding principles

#### Test your code like a user would

> The more your tests resemble the way your software is used, the more confidence they can give you.

Test your code using clicks, typing, and other browser events from the "outside" of the component boundary. Don't test the implementation details of your component. Most testing libraries do too much by allowing you to mock or "reach into" your component, which quickly becomes the happy path. Imagine I have a class-based component:

```javascript
class MyComponent extends React.Component {
  doSomeComplicatedThing() {
    // make an API request, ...
  }

  render() {
    <button onClick={doSomeComplicatedThing}>Click me!</button>
  }
}
```

With Enzyme, for example, it's pretty easy to render your mocked component instance and then just directly invoke `doSomeComplicatedThing`:

```javascript
const wrapper = shallow(<MyComponent />);
wrapper.instance().doSomeComplicatedThing();
```

And although this example is a bit contrived, this is a very tempting pattern if your component is complex and it's hard to exercise the code from the outside. But it's not a very good test, for a few reasons:

1. Imagine I refactor this component to be function-based with a `useEffect` hook. The behavior should be the same (and I want my tests to give me confidence that I haven't broken things during a refactor) but I have to completely rewrite my test since my component no longer has a `doSomeComplicatedThing` method. This also reduces my confidence since I could miss some behavioral change in the process of rewriting my test so that it passes again.
2. My test doesn't cover the full surface of my code -- it skips the interface between the user clicking the button and the method being executed. Maybe I mistyped the function name, or called the wrong function entirely -- the test will pass but the user will see the wrong behavior.

#### Test your code with a real DOM

Don't use a mocked interface or a wrapper. This is an extension of the first principle -- your user is going to experience your component rendered in a browser as a real DOM, so your test should mirror that as much as possible. This offers a few benefits:

1. It's future-proof. React hooks didn't work in Enzyme for months after they were released, because substantial parts of the library had to be rewritten to properly mock things out. They worked in the browser from day 1. (Sometimes you run across an API like `MutationObserver` that isn't supported in all browsers, but that's easy to fix with a polyfill and useful information that you might need to polyfill for your end users too.)
2. It reduces the number of layers under test. With a simple DOM-based test, bugs can come from 1) React rendering (unlikely) or 2) your code. With a wrapper interface, bugs can also come from any number of ways in which the interface fails to accurately mock out the underlying behavior. These are not common but they do happen and they're a devil to debug.

#### Accessibility

A side effect of both of the above principles is accessibility. The helpers that react-testing-library exposes only work well if your code is accessible -- for example if you have an `<input>` with no label, it's going to be hard to get a handle on it in order to type in it for a test. react-testing-library aligns incentives so that you are driven to make your code more accessible in order to make it easier to test.

[Further reading](https://testing-library.com/docs/guiding-principles)

### Zach's opinions on react-testing-library

The first section is mostly taken from the react-testing-library docs and/or Kent C. Dodds' Twitter feed (the author of react-testing-library). This section is my own opinions, which are derived from experience but take with some grains of salt.

#### Limit mocking to external boundaries

Find the boundary where your component interacts with the outside world, and only mock those boundaries. The two most common boundaries are:

1. **Network** -- you are usually executing react-testing-library tests in isolation, without your API or other backend. Use fetch mocks (or GraphQL, etc) to mock requests to the server and provide responses back to your component.
2. **Browser events** -- the user experiences your component through a browser (without seeing into the implementation details). Provide inputs via clicks, typing, etc. to exercise the functionality of your component

#### Avoid snapshot tests

Avoid the siren song of snapshot tests -- tests which capture a snapshot of the DOM and then compare the rendering output against that snapshot when the test is re-executed. They are quick to write but you are almost always better served writing a more bespoke test that will be more durable.

1. They're brittle -- a snapshot test will change whenever any minor detail of your component changes, like a classname or an unimportant element. It's annoying to have your tests churn constantly and it undermines your confidence that your test suite is validating existing behavior.
2. It's easy for mistakes to slip through. To update snapshots when a component changes, you run `yarn test -u` to rewrite the snapshots, and then in code review a colleague carefully examines the differences in the snapshot to ensure they're all intended changes and nothing has broken... that's a nice idea but in practice it just doesn't happen. Reviewing snapshot diffs is tedious and very few people actually end up doing it.
