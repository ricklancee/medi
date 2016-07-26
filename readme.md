# Mediator

### What is an mediator?

From wikipedia: "[A mediator] promotes loose coupling by keeping objects from referring to each other explicitly, and it allows their interaction to be varied independently."


### Basic Usage

```js
import Mediator from 'mediator';

var M = new Mediator();

M.when('somethingHappend', data => {
  console.log(data); // {foo: 'bar'}
});

M.emit('somethingHappend', { foo: 'bar' });

```

### Using multiple arguments. 

```js
import Mediator from 'mediator';

var M = new Mediator();

M.when('somethingHappend', (foo, bar, baz) => {
  console.log(foo); // 'foo'
  console.log(bar); // 'bar'
  console.log(baz); // 'baz'
});

M.emit('somethingHappend', 'foo', 'bar', 'baz');

```

### Extending objects

```js
import Mediator from 'mediator';

var M = new Mediator();

var obj = {};

M.extend(obj);

obj.when('something', data => {
  console.log(data); // 'foo'
});

M.when('something', data => {
  console.log(data); // 'foo'
});

obj.emit('somethingHappend', 'foo');

```
