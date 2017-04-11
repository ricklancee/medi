import test from 'ava';
import sinon from 'sinon';
import medi from './medi';

test.beforeEach(t => {
  console.warn = sinon.spy();
  console.info = sinon.spy();

  t.context.mediator = medi();
});

test('handler a message', t => {
  const handlerFn = sinon.spy();

  t.context.mediator.when('somechannel', handlerFn);
  t.context.mediator.emit('somechannel', 'somemessage');

  t.true(handlerFn.calledWith('somemessage'));
});

test('multiple handlers will be called', t => {
  const handlerOneFn = sinon.spy();
  const handlerTwoFn = sinon.spy();

  t.context.mediator.when('somechannel', handlerOneFn);
  t.context.mediator.when('somechannel', handlerTwoFn);
  t.context.mediator.emit('somechannel', 'somemessage');

  t.true(handlerOneFn.calledWith('somemessage'));
  t.true(handlerTwoFn.calledWith('somemessage'));
});

test('delete a channel', t => {
  const handlerFn = sinon.spy();
  t.context.mediator.when('somechannel', handlerFn);

  t.context.mediator.delete('somechannel');

  t.context.mediator.emit('somechannel', 'somemessage');

  t.false(handlerFn.called);
});

test('delete a specific handler on a channel', t => {
  const notCalledHandlerFn = sinon.spy();
  const calledHandlerFn = sinon.spy();

  t.context.mediator.when('somechannel', notCalledHandlerFn);
  t.context.mediator.when('somechannel', calledHandlerFn);

  t.context.mediator.delete('somechannel', notCalledHandlerFn);

  t.context.mediator.emit('somechannel', 'somemessage');

  t.false(notCalledHandlerFn.called);
  t.true(calledHandlerFn.calledWith('somemessage'));
});

test('filter message handlers', t => {
  const notCalledHandlerFn = sinon.spy();
  const calledHandlerFn = sinon.spy();

  t.context.mediator.when('somechannel', { someprop: 'notmatchingvalue' }, notCalledHandlerFn);
  t.context.mediator.when('somechannel', { someprop: 'valuetomatch' }, calledHandlerFn);

  t.context.mediator.emit('somechannel', { someprop: 'valuetomatch' }, 'somemessage');

  t.false(notCalledHandlerFn.called);
  t.true(calledHandlerFn.calledWith('somemessage'));
});

test('calling emit with a filter on a channel without a filter, should not work', t => {
  const notCalledHandlerFn = sinon.spy();

  t.context.mediator.when('somechannel', notCalledHandlerFn);
  t.context.mediator.emit('somechannel', { someprop: 'somevalue' }, 'somemessage');

  t.false(notCalledHandlerFn.called);
});

test('console will be called when logging is on', t => {
  t.context.mediator = medi({log: true});

  t.context.mediator.when('somechannel', () => {});
  t.context.mediator.emit('somechannel', 'somemessage');

  t.deepEqual(console.info.args[0], [
    'Emitting event: \"somechannel\" with payload:',
    'somemessage',
    ' and filter: ',
    null
  ]);

  t.context.mediator.delete('somechannel');
  t.context.mediator.emit('somechannel', 'somemessage');

  t.deepEqual(console.warn.args[0], [
    'Emit: No handlers for event: \"somechannel\", args: ',
    'somemessage'
  ]);
});

test('console will not be called when logging is off', t => {
  t.context.mediator = medi({log: false});

  t.context.mediator.when('somechannel', () => {});
  t.context.mediator.emit('somechannel', 'somemessage');

  t.false(console.info.called);

  t.context.mediator.delete('somechannel');
  t.context.mediator.emit('somechannel', 'somemessage');

  t.false(console.warn.called);
});
