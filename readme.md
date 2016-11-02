# Mediator

### What is an mediator?

From wikipedia: "[A mediator] promotes loose coupling by keeping objects from referring to each other explicitly, and it allows their interaction to be varied independently."


### Basic Usage

```js
var M = new Mediator();

M.when('somethingHappend', data => {
  console.log(data); // {foo: 'bar'}
});

M.emit('somethingHappend', { foo: 'bar' });

```

### Using multiple arguments. 

```js
var M = new Mediator();

M.when('somethingHappend', (foo, bar, baz) => {
  console.log(foo); // 'foo'
  console.log(bar); // 'bar'
  console.log(baz); // 'baz'
});

M.emit('somethingHappend', 'foo', 'bar', 'baz');

```

### Extending existing objects with mediator behaviour
```js
var object = {
};

medi.extend(object);

medi.when('foo', (msg) => {console.log('on mediator: '+msg)});
object.when('foo', (msg) => {console.log('on object: '+msg)});

object.emit('foo', 'from object, bar');
medi.emit('foo', 'from mediator, baz');

```

### Loose coupling example.

```js
var M = new Mediator();

var user = {
  name: null, 
  register: function() {
    // Code to register the user
    M.emit('userHasRegistered', user);
  }
};

var notificationModal = {
  show: function(message) {
    // code to show a modal.
  },
  init: function() {
    M.when('userHasRegistered', user => {
      notificationModal.show(`Welcome! ${user.name}`);
    });
  }  
};

// App bootstrap code
notificationModal.init();

// Register a new user
user.name = 'Jane Doe';
user.subscribe();

// Now the the Notification model will be triggered because
// it is listening for the 'userHasRegistered' event, which has been emitted
// by the user object (facilitated by the mediator).

```
