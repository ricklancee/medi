# Mediator

### What is an mediator?

From wikipedia: "[A mediator] promotes loose coupling by keeping objects from referring to each other explicitly, and it allows their interaction to be varied independently."


#### Basic example

```js
const bus = mediator();

bus.when('somethingHappend', data => {
  console.log(data); // {foo: 'bar'}
});

bus.emit('somethingHappend', { foo: 'bar' });

```

#### Deleting an channel

```js
const bus = mediator();

const notCalledHandler = data => {
  console.log(data);
};

bus.when('somethingHappend', notCalledHandler); // handler will not be called
bus.delete('somethingHappend');
bus.emit('somethingHappend', { foo: 'bar' });

```

#### Deleting an specific handler on a channel

```js
const bus = mediator();

const calledHandler = data => {
  console.log(data);
};

const notCalledHandler = data => {
  console.log(data);
};

bus.when('somethingHappend', notCalledHandler); // will not be called
bus.when('somethingHappend', calledHandler); // will be called
bus.delete('somethingHappend', notCalledHandler);
bus.emit('somethingHappend', { foo: 'bar' });

```

#### Filtering events
```js

const bus = mediator();

const filter = {
  someprop: 'matchingvalue'
};

const notMatchingFilter = {
  someprop: 'notmatchingvalue'
}

const handler = data => {
  console.log(data);
};


bus.when('somethingHappend', filter, handler);
bus.emit('somethingHappend', filter, { foo: 'bar' });
bus.emit('somethingHappend', notMatchingFilter, { foo: 'bar' }); // will not trigger the handler

```

#### Loose coupling example.

```js
const bus = mediator();

const user = {
  name: null,
  register: function() {
    // Code to register the user
    bus.emit('userHasRegistered', user);
  }
};

const notificationModal = {
  show: function(message) {
    // code to show a modal.
  },
  init: function() {
    bus.when('userHasRegistered', user => {
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

