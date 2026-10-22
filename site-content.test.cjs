const test=require('node:test'),assert=require('node:assert/strict'),{defaults,valid}=require('./site-content.cjs');
test('Site settings validate media and bounded text',()=>{
assert(valid(defaults));assert(valid({...defaults,videos:[{title:'Proceso',url:'https://example.com/cut.mp4?version=1'}]}));
for(const url of ['javascript:alert(1)','http://example.com/a.mp4','https://youtube.com/watch?v=test','https://user:secret@example.com/a.mp4'])assert(!valid({...defaults,videos:[{title:'Video',url}]}));
assert(!valid({...defaults,headline:''}));assert(!valid({...defaults,phone:'<script>'}));assert(!valid({...defaults,videos:Array(7).fill({title:'Video',url:'https://example.com/a.mp4'})}));
});
