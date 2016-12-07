import test from 'ava';
import sinon from 'sinon';
import Mediator from './mediator';

let bus;
test.beforeEach(t => {
  bus = new Mediator();
});

test('handler a message', t => {
  const handlerFn = sinon.spy();

  bus.when('somechannel', handlerFn);
  bus.emit('somechannel', 'somemessage');

  t.true(handlerFn.calledWith('somemessage'));
});

test('multiple handlers will be called', t => {
  const handlerOneFn = sinon.spy();
  const handlerTwoFn = sinon.spy();

  bus.when('somechannel', handlerOneFn);
  bus.when('somechannel', handlerTwoFn);
  bus.emit('somechannel', 'somemessage');

  t.true(handlerOneFn.calledWith('somemessage'));
  t.true(handlerTwoFn.calledWith('somemessage'));
});

test('delete a channel', t => {
  const handlerFn = sinon.spy();
  bus.when('somechannel', handlerFn);

  bus.delete('somechannel');

  bus.emit('somechannel', 'somemessage');

  t.false(handlerFn.called);
});

test('delete a specific handler on a channel', t => {
  const notCalledHandlerFn = sinon.spy();
  const calledHandlerFn = sinon.spy();

  bus.when('somechannel', notCalledHandlerFn);
  bus.when('somechannel', calledHandlerFn);

  bus.delete('somechannel', notCalledHandlerFn);

  bus.emit('somechannel', 'somemessage');

  t.false(notCalledHandlerFn.called);
  t.true(calledHandlerFn.calledWith('somemessage'));
});


test('filter message handlers', t => {
  const notCalledHandlerFn = sinon.spy();
  const calledHandlerFn = sinon.spy();

  bus.when('somechannel', { someprop: 'notmatchingvalue' }, notCalledHandlerFn);
  bus.when('somechannel', { someprop: 'valuetomatch' }, calledHandlerFn);

  bus.emit('somechannel', { someprop: 'valuetomatch' }, 'somemessage');

  t.false(notCalledHandlerFn.called);
  t.true(calledHandlerFn.calledWith('somemessage'));
});