dynamic-vietq
=============

A class generate dynamic VietQR

Installation
------------
  via npm:

      $ npm install dynamic-vietqr

  via yarn:

      $ yarn add dynamic-vietqr

Example
----------------
```ts
import { VietQr } from 'dynamic-vietqr';

const vietqr = new NapasQr('2112995044604025', '970403');

const qr = vietqr.dynamicIBFTToAccount('10000', 'order');

console.log(qr);
// 00020101021238530010A0000007270123000697040301090123456780208QRIBFTTA530370454061000005802VN62090805order6304D44C

```

### API options

``` js
new NapasQr(options)
```
 - `accountOrCardNumber`: `String` Account service or Card service.
 - `bnbId`: `String` Banks in Vietnam can use BIN code that was registered by State Bank of Vietnam. For example: 970403
 