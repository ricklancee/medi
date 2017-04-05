# Medi, a mediator that supports event filtering

### What is an mediator?

A mediator facilitates communication between objects without them knowing about each others existence. From wikipedia: "[A mediator] promotes loose coupling by keeping objects from referring to each other explicitly, and it allows their interaction to be varied independently."

#### Usage

Install medi via npm or yarn: `npm install medi` or `yarn add medi`.

```js
import medi from 'medi';

const mediator = medi();

mediator.when('somethingHappend', data => {
  console.log(data); // {foo: 'bar'}
});

mediator.emit('somethingHappend', { foo: 'bar' });
```

#### Deleting an channel

```js
const mediator = medi();

const notCalledHandler = data => {
  console.log(data);
};

mediator.when('somethingHappend', notCalledHandler); // handler will not be called
mediator.delete('somethingHappend');
mediator.emit('somethingHappend', { foo: 'bar' });
```

#### Deleting an specific handler on a channel

```js
const mediator = medi();

const calledHandler = data => {
  console.log(data);
};

const notCalledHandler = data => {
  console.log(data);
};

mediator.when('somethingHappend', notCalledHandler); // will not be called
mediator.when('somethingHappend', calledHandler); // will be called
mediator.delete('somethingHappend', notCalledHandler);
mediator.emit('somethingHappend', { foo: 'bar' });
```

#### Filtering events
```js
const mediator = medi();

const filter = {
  someprop: 'matchingvalue'
};

const notMatchingFilter = {
  someprop: 'notmatchingvalue'
}

const handler = data => {
  console.log(data);
};


mediator.when('somethingHappend', filter, handler);
mediator.emit('somethingHappend', filter, { foo: 'bar' });
mediator.emit('somethingHappend', notMatchingFilter, { foo: 'bar' }); // will not trigger the handler
```

#### Loose coupling example.

```js
const mediator = medi();

const user = {
  name: null,
  register: function() {
    // Code to register the user
    mediator.emit('userHasRegistered', user);
  }
};

const notificationModal = {
  show: function(message) {
    // code to show a modal.
  },
  init: function() {
    mediator.when('userHasRegistered', user => {
      notificationModal.show(`Welcome! ${user.name}`);
    });
  }
};

// App bootstrap code
notificationModal.init();

// Register a new user
user.name = 'Jane Doe';
user.register();
// this will trigger the notification modal to show because
// it's listing to the 'userHasRegistered' event that the user will emit.
```
The two components do not explicitly know about each others existance they only listen to
the events on the mediator and act on those.

### Testing

Install dependencies with `npm install` and run `npm test` or `npm test -- --watch` for watching.
