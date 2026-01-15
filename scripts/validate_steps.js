import fs from 'fs';
import path from 'path';
import('file://' + path.resolve('./src/utils/stepByStepHandlers.js')).then(mod=>{
  const { buildSteps } = mod;
  return import('file://' + path.resolve('./src/utils/aes_manual_v2.js')).then(aes=>{
    const { subBytes, shiftRows, mixColumns, addRoundKey, invSubBytes, invShiftRows, invMixColumns } = aes;
    const rnd = (n)=>Math.floor(Math.random()*n);

    const key = '1234567890abcdef';
    const text = 'abcdefghijklmnop';
    const initial = Array.from(text).map(c=>c.charCodeAt(0));
    const keyBytes = Array.from(key).map(c=>c.charCodeAt(0));
    const expanded = aes.keyExpansion(keyBytes,128);
    const roundKeys = [];
    for(let i=0;i<=10;i++) roundKeys.push(expanded.slice(i*16,(i+1)*16));

    const descriptorsEnc = buildSteps(initial, roundKeys, 10, 'encrypt');
    const descriptorsDec = buildSteps(initial, roundKeys, 10, 'decrypt');

    const applyOp = (op, input) => {
      if (op === 'SubBytes') return subBytes(input.slice());
      if (op === 'ShiftRows') return shiftRows(input.slice());
      if (op === 'MixColumns') return mixColumns(input.slice());
      if (op === 'AddRoundKey') return addRoundKey(input.slice(), roundKeys[Number(op.split('-')[0])]);
      if (op === 'InvSubBytes') return invSubBytes(input.slice());
      if (op === 'InvShiftRows') return invShiftRows(input.slice());
      if (op === 'InvMixColumns') return invMixColumns(input.slice());
      // fallback: return input
      return input;
    };

    // Simple validator loop (best-effort): check that applying the named op to inputState equals outputState
    const hexToArr = (hexStr)=>hexStr.split(' ').map(h=>parseInt(h,16));
    let errors = 0;

    const check = (desc) => {
      const inArr = hexToArr(desc.inputState);
      const outArr = hexToArr(desc.outputState);
      let computed;
      switch(desc.op) {
        case 'SubBytes': computed = subBytes(inArr); break;
        case 'ShiftRows': computed = shiftRows(inArr); break;
        case 'MixColumns': computed = mixColumns(inArr); break;
        case 'AddRoundKey': computed = addRoundKey(inArr, roundKeys[desc.roundKeyIndex]); break;
        case 'InvSubBytes': computed = invSubBytes(inArr); break;
        case 'InvShiftRows': computed = invShiftRows(inArr); break;
        case 'InvMixColumns': computed = invMixColumns(inArr); break;
        default: computed = inArr;
      }
      const ok = computed.map(b=>b&0xFF).join(',') === outArr.map(b=>b&0xFF).join(',');
      if (!ok) {
        console.error('Mismatch for', desc.id, desc.op);
        console.error('in :', inArr.map(b=>b.toString(16).padStart(2,'0')).join(' '));
        console.error('exp:', outArr.map(b=>b.toString(16).padStart(2,'0')).join(' '));
        console.error('got:', computed.map(b=>b.toString(16).padStart(2,'0')).join(' '));
        errors++;
      }
    };

    descriptorsEnc.forEach(check);
    descriptorsDec.forEach(check);

    if (errors===0) console.log('Validator: all descriptors matched their operations');
    else console.log('Validator: errors found =', errors);
  });
}).catch(e=>{console.error(e);process.exit(1);});
