import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.mjs';

const session='12345678-1234-4123-8123-123456789012';
function harness() {
  const rows=[];
  const env={
    JOURNEY:{writeDataPoint(row){rows.push(row);}},
    ASSETS:{fetch:()=>new Response('static site')}
  };
  function send(data, headers={}) {
    return worker.fetch(new Request('https://talka.io99.xyz/api/journey',{
      method:'POST',
      headers:{Origin:'https://talka.io99.xyz','Content-Type':'application/json',...headers},
      body:JSON.stringify(data)
    }),env);
  }
  return {send,rows,env};
}
test('valid event stored with only anonymous session ID, event and step',async()=>{
  const {send,rows}=harness();
  assert.equal((await send({session,event:'connect_success',step:4})).status,204);
  assert.deepEqual(rows,[{blobs:[session,'connect_success'],doubles:[4],indexes:[session]}]);
});
test('disallow unknown event, personal fields, wrong origin and malformed session',async()=>{
  const {send,rows}=harness();
  for(const data of [
    {session,event:'wallet_address',step:1},
    {session,event:'page_view',step:2,address:'0x123'},
    {session:'invalid',event:'page_view',step:1},
    {session,event:'page_view',step:-2}
  ]) assert.equal((await send(data)).status,400);
  assert.equal((await send({session,event:'page_view',step:1},{Origin:'https://evil.example'})).status,403);
  assert.equal(rows.length,0);
});
test('non-API routes use Worker static asset binding',async()=>{
  const {env}=harness();
  assert.equal(await (await worker.fetch(new Request('https://talka.io99.xyz/'),env)).text(),'static site');
});
