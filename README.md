dynamic-vietq
=============

A class generate dynamic VietQR

Installation
------------
  via npm:

      $ npm install dynamic-vietqr

  via yarn:

      $ yarn add dynamic-vietqr

Usage
----------------
```ts
import { VietQr } from 'dynamic-vietqr';

const vietqr = new VietQr('0011012345678', '970403');
```

Example
----------------
Dynamic QR IBFT to Account
```ts
// dynamicIBFTToAccount(amount, message)
const dynamicAccount = vietqr.dynamicIBFTToAccount('180000', 'thanh toan don hang');

console.log(dynamicAccount);
// 00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTA530370454061800005802VN62230819thanh toan don hang63045FAB
```

Dynamic QR IBFT to Card
```ts
// dynamicIBFTToCard(amount, message)
const dynamicCard = vietqr.dynamicIBFTToCard('180000', 'thanh toan don hang');

console.log(dynamicCard);
// 00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTC530370454061800005802VN62230819thanh toan don hang630415C1
```

Static QR IBFT to Account
```ts
const staticAccount = vietqr.staticIBFTToAccount();
console.log(staticAccount);
// 00020101021138570010A00000072701270006970403011300110123456780208QRIBFTTA53037045802VN63049E6F
```

Static QR IBFT to Card
```ts
const staticCard = vietqr.staticIBFTToCard();
console.log(staticCard);
// 00020101021138570010A00000072701270006970403011300110123456780208QRIBFTTC53037045802VN63046E2C
```

### API options

``` js
new VietQr(accountOrCardNumber, bnbId)
```
 - `accountOrCardNumber`: `String` Account service or Card service.
 - `bnbId`: `String` Banks in Vietnam can use BIN code that was registered by State Bank of Vietnam. For example: 970403
 
 