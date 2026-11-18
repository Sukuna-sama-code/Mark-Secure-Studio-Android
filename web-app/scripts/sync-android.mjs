import {cpSync,rmSync} from 'node:fs';
const target=new URL('../../app/src/main/assets/',import.meta.url);
rmSync(target,{recursive:true,force:true});
cpSync(new URL('../dist/',import.meta.url),target,{recursive:true});
console.log('Android assets updated');
