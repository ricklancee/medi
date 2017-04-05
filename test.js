import test from 'ava';
import sinon from 'sinon';
import medi from './medi';

test.beforeEach(t => {
  t.context.mediator = medi({ log: true });
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
