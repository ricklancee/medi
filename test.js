import test from 'ava';
import sinon from 'sinon';
import medi from './medi';

test.beforeEach(t => {
  t.context.consoleWarn = console.warn = sinon.spy();
  t.context.consoleInfo = console.info = sinon.spy();

  t.context.mediator = medi();
});

test('handler a message', async t => {
  const handlerFn = sinon.spy();

  t.context.mediator.when('somechannel', handlerFn);
  t.context.mediator.emit('somechannel', 'somemessage');

  t.true(handlerFn.calledWith('somemessage'));
});

test('multiple handlers will be called', async t => {
  const handlerOneFn = sinon.spy();
  const handlerTwoFn = sinon.spy();

  t.context.mediator.when('somechannel', handlerOneFn);
  t.context.mediator.when('somechannel', handlerTwoFn);
  t.context.mediator.emit('somechannel', 'somemessage');

  t.true(handlerOneFn.calledWith('somemessage'));
  t.true(handlerTwoFn.calledWith('somemessage'));
});

test('delete a channel', async t => {
  const handlerFn = sinon.spy();
  t.context.mediator.when('somechannel', handlerFn);

  t.context.mediator.delete('somechannel');

  t.context.mediator.emit('somechannel', 'somemessage');

  t.false(handlerFn.called);
});

test('delete a specific handler on a channel', async t => {
  const notCalledHandlerFn = sinon.spy();
  const calledHandlerFn = sinon.spy();

  t.context.mediator.when('somechannel', notCalledHandlerFn);
  t.context.mediator.when('somechannel', calledHandlerFn);

  t.context.mediator.delete('somechannel', notCalledHandlerFn);

  t.context.mediator.emit('somechannel', 'somemessage');

  t.false(notCalledHandlerFn.called);
  t.true(calledHandlerFn.calledWith('somemessage'));
});

test('delete a specific handler that doesn\'t exists anymore', async t => {
  t.context.mediator = medi({log: true});
  t.context.mediator.when('somechannel', () => {});
  t.context.mediator.delete('somechannel');
  t.context.mediator.delete('somechannel');

  t.deepEqual(t.context.consoleWarn.args[0], [
    'Delete(): No handlers for channel \"somechannel\"; nothing to delete'
  ]);
});

test('Trying to delete a handler that doesn\'t exists on the channel should not work', async t => {
  t.context.mediator = medi({log: true});
  const handler = () => {};
  const secondHandlerThatDoesntExist = () => {};

  t.context.mediator.when('somechannel', handler);
  t.context.mediator.delete('somechannel', secondHandlerThatDoesntExist);

  t.deepEqual(t.context.consoleWarn.args[0], [
    'Delete(): Given handler does not exists on channel \"somechannel\"'
  ]);
});

test('filter message handlers', async t => {
  t.context.mediator = medi({log: true});
  const notCalledHandlerFn = sinon.stub().returns(123);
  const calledHandlerFn = sinon.stub().returns(312);

  t.context.mediator.when('somechannel', { someprop: 'notmatchingvalue' }, notCalledHandlerFn);
  t.context.mediator.when('somechannel', { someprop: 'valuetomatch' }, calledHandlerFn);

  const result = await t.context.mediator.emit('somechannel', { someprop: 'valuetomatch' }, 'somemessage');

  t.false(notCalledHandlerFn.called);
  t.true(calledHandlerFn.calledWith('somemessage'));
  t.deepEqual(result, [ 312 ]);

  t.deepEqual(t.context.consoleWarn.args[0], [
    'Emit(): Not calling channel \"somechannel\", given filter does not match channel\'s filter'
  ]);
});

test('calling a channel that has a filter without specifing a filter should not be called', async t => {
  t.context.mediator = medi({log: true});
  const notCalledHandlerFn = sinon.spy();

  t.context.mediator.when('somechannel', { filter: 'somefiltervalue' }, notCalledHandlerFn);
  t.context.mediator.emit('somechannel', 'somemessage');

  t.false(notCalledHandlerFn.called);

  t.deepEqual(t.context.consoleWarn.args[0], [
    'Emit(): Not calling channel \"somechannel\", channel has a filter; no filter given'
  ]);
});

test('calling emit with a filter on a channel without a filter, should not work', async t => {
  const notCalledHandlerFn = sinon.spy();

  t.context.mediator.when('somechannel', notCalledHandlerFn);
  t.context.mediator.emit('somechannel', { someprop: 'somevalue' }, 'somemessage');

  t.false(notCalledHandlerFn.called);
});

test('fireing promise after all when handlers have been called', async t => {
  t.context.mediator.when('somechannel', () => {
    return 1;
  });
  t.context.mediator.when('somechannel', () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(2);
      }, 16);
    })
  });
  t.context.mediator.when('somechannel', () => {});
  t.context.mediator.when('somechannel', () => {
    return 1;
  });


  const result = await t.context.mediator.emit('somechannel', 'somemessage');

  t.deepEqual(result, [1, 2, 1]);
});

test('console will be called when logging is on', async t => {
  t.context.mediator = medi({log: true});

  t.context.mediator.when('somechannel', () => {});
  t.context.mediator.emit('somechannel', 'somemessage');

  t.deepEqual(t.context.consoleInfo.args[0], [
    'Emit(): Emitting event \"somechannel\" with payload:',
    'somemessage',
    'and filter: ',
    null
  ]);

  t.context.mediator.delete('somechannel');
  t.context.mediator.emit('somechannel', 'somemessage');

  t.deepEqual(t.context.consoleWarn.args[0], [
    'Emit(): No handlers for event \"somechannel\", args: ',
    'somemessage'
  ]);
});

test('console will not be called when logging is off', async t => {
  t.context.mediator = medi({log: false});

  t.context.mediator.when('somechannel', () => {});
  t.context.mediator.emit('somechannel', 'somemessage');

  t.false(t.context.consoleInfo.called);

  t.context.mediator.delete('somechannel');
  t.context.mediator.emit('somechannel', 'somemessage');

  t.false(t.context.consoleWarn.called);
});
