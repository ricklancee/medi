import test from 'ava';
import sinon from 'sinon';
import mediator from './mediator';

test.beforeEach(t => {
  t.context.bus = mediator({ log: true });
});

test('handler a message', t => {
  const handlerFn = sinon.spy();

  t.context.bus.when('somechannel', handlerFn);
  t.context.bus.emit('somechannel', 'somemessage');

  t.true(handlerFn.calledWith('somemessage'));
});

test('multiple handlers will be called', t => {
  const handlerOneFn = sinon.spy();
  const handlerTwoFn = sinon.spy();

  t.context.bus.when('somechannel', handlerOneFn);
  t.context.bus.when('somechannel', handlerTwoFn);
  t.context.bus.emit('somechannel', 'somemessage');

  t.true(handlerOneFn.calledWith('somemessage'));
  t.true(handlerTwoFn.calledWith('somemessage'));
});

test('delete a channel', t => {
  const handlerFn = sinon.spy();
  t.context.bus.when('somechannel', handlerFn);

  t.context.bus.delete('somechannel');

  t.context.bus.emit('somechannel', 'somemessage');

  t.false(handlerFn.called);
});

test('delete a specific handler on a channel', t => {
  const notCalledHandlerFn = sinon.spy();
  const calledHandlerFn = sinon.spy();

  t.context.bus.when('somechannel', notCalledHandlerFn);
  t.context.bus.when('somechannel', calledHandlerFn);

  t.context.bus.delete('somechannel', notCalledHandlerFn);

  t.context.bus.emit('somechannel', 'somemessage');

  t.false(notCalledHandlerFn.called);
  t.true(calledHandlerFn.calledWith('somemessage'));
});

test('filter message handlers', t => {
  const notCalledHandlerFn = sinon.spy();
  const calledHandlerFn = sinon.spy();

  t.context.bus.when('somechannel', { someprop: 'notmatchingvalue' }, notCalledHandlerFn);
  t.context.bus.when('somechannel', { someprop: 'valuetomatch' }, calledHandlerFn);

  t.context.bus.emit('somechannel', { someprop: 'valuetomatch' }, 'somemessage');

  t.false(notCalledHandlerFn.called);
  t.true(calledHandlerFn.calledWith('somemessage'));
});

test('calling emit with a filter on a channel without a filter, should not work', t => {
  const notCalledHandlerFn = sinon.spy();

  t.context.bus.when('somechannel', notCalledHandlerFn);
  t.context.bus.emit('somechannel', { someprop: 'somevalue' }, 'somemessage');

  t.false(notCalledHandlerFn.called);
});
