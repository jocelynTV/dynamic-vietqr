export class VietQr {
  private accountOrCardNumber;
  private bnbId;

  /**
   * @constructor
   * @param {string} accountOrCardNumber - Account service or Card service.
   * @param {string} bnbId - Banks in Vietnam can use BIN code that was registered by State Bank of Vietnam. For example: 970403
   */
  constructor(accountOrCardNumber: string, bnbId: string) {
    this.accountOrCardNumber = accountOrCardNumber;
    this.bnbId = bnbId;
  }

  private formatString(input: string): string {
    const length = input.length;
    if (!isNaN(length)) {
      const formattedLength =
        length < 10 ? `0${length}${input}` : `${length}${input}`;
      return formattedLength;
    }
    return input;
  }

  /**
   * Generate Dynamic QR IBFT to Account
   * @param {string} amount - Transaction Amount
   * @param {string} message - Maximum 25 characters: Any value in order to define the purpose of the transaction, for example: billing, topup or purchase, etc…
   * @returns qrcode
   */
  dynamicIBFTToAccount(amount: string, message: string): string {
    return this.qrGeneration({
      amount,
      service: "QRIBFTTA",
      message,
      dynamic: true,
    });
  }

  /**
   * Generate Dynamic QR IBFT to Card
   * @param {string} amount - Transaction Amount
   * @param {string} message - Maximum 25 characters: Any value in order to define the purpose of the transaction, for example: billing, topup or purchase, etc…
   * @returns qrcode
   */
  dynamicIBFTToCard(amount: string, message: string): string {
    return this.qrGeneration({
      amount,
      service: "QRIBFTTC",
      message,
      dynamic: true,
    });
  }

  /**
   * Generate Static QR IBFT to Account
   * @returns qrcode
   */
  staticIBFTToAccount(): string {
    return this.qrGeneration({ service: "QRIBFTTA", dynamic: false });
  }

  /**
   * Generate Static QR IBFT to Card
   * @returns qrcode
   */
  staticIBFTToCard(): string {
    return this.qrGeneration({ service: "QRIBFTTC", dynamic: false });
  }

  private qrGeneration({
    amount,
    service,
    message,
    dynamic,
  }: {
    amount?: string;
    service: "QRPUSH" | "QRCASH" | "QRIBFTTC" | "QRIBFTTA";
    message?: string;
    dynamic?: boolean;
  }): string {
    /**
     * Payload Format Indicator
     * @description ID: 00
     * @description Length: 02
     * @default 01
     */
    const payloadFormatIndicator = "000201";

    /**
     * Point of Initiation Method
     * @description ID: 01
     * @description Length: 02
      - 11: Static QR
      - 12: Dynamic QR
     */
    let point = "11";
    if (dynamic) {
      point = "12";
    }
    const pointofInitiationMethod = `01${this.formatString(point)}`;

    /**
     * Global Unique Identifier - GUID
     * @description ID: 00
     * @description Length: 10
     * @default A000000727
     */
    const GUID = `00${this.formatString("A000000727")}`;

    /**
     * Payment network specific (Member banks, Payment Intermediaries)
     * @description ID: 01
     */
    const bnbIdCode = `00${this.formatString(this.bnbId)}`;
    const account = `01${this.formatString(this.accountOrCardNumber)}`;
    const paymentNetworkSpecific = `01${this.formatString(
      bnbIdCode + account
    )}`;

    /**
     * Service Code
     * @description ID: 02
     * @description Length: 10
      - QRPUSH: Productpayment service by QR
      - QRCASH: Cash withdrawl service at ATM by QR
      - QRIBFTTC: Inter-Bank Fund Transfer 24/7 to Card service by QR
      - QRIBFTTA: Inter-Bank Fund Transfer 24/7 to Account service by QR
     */
    const serviceCode = `02${this.formatString(service)}`;

    /**
     * Merchant Account Information
     * @description ID: 38
     */
    const merchantAccountInformation = `38${this.formatString(
      GUID + paymentNetworkSpecific + serviceCode
    )}`;

    /**
     * Transaction Currency
     * @description ID: 53
     * @description Length: 03
     * @default 704
     */
    const transactionCurrency = `53${this.formatString("704")}`;

    /**
     * Transaction Amount
     * @description ID: 54
     * @description Length: up to 13
     */
    let transactionAmount = "";
    if (amount) {
      transactionAmount = `54${this.formatString(amount)}`;
    }

    /**
     * Country Code
     * @description ID: 58
     * @description Length: 02
     * @default VN
     */
    const countryCode = `58${this.formatString("VN")}`;

    let additional = "";

    if (message) {
      if (message.length > 25) {
        throw Error("Message max 25 characters");
      }
      /**
       * Purpose of Transaction
       * @description ID: 08
       * @description Length: up to 25
       * @default VN
       */
      const purpose = `08${this.formatString(message)}`;

      /**
       * Additional Data Field Template
       * @description ID: 62
       * @description Length: up to 99
       */
      additional = `62${this.formatString(purpose)}`;
    }

    /**
     * CRC (Cyclic Redundancy Check)
     * @description ID: 63
     * @description Length: 04
     */

    const CRC = `6304`;

    const value =
      payloadFormatIndicator +
      pointofInitiationMethod +
      merchantAccountInformation +
      transactionCurrency +
      transactionAmount +
      countryCode +
      additional +
      CRC;

    const crc = this.crc16(value).toString(16).toLocaleUpperCase();
    if (crc.length !== 4) {
      throw Error("CRC is not equal 4");
    }

    return `${value}${crc}`;
  }

  private crc16(str: string) {
    let j;
    let i;
    let crc = 0xffff;

    for (i = 0; i < str.length; i += 1) {
      const c = str.charCodeAt(i);

      if (c > 255) {
        throw new RangeError();
      }

      j = (c ^ (crc >> 8)) & 0xff;
      crc = CRC_TABLE[j] ^ (crc << 8);
    }

    return (crc ^ 0) & 0xffff;
  }
}

const CRC_TABLE: Array<number> = [
  0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108,
  0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
  0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6, 0x9339, 0x8318, 0xb37b,
  0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
  0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee,
  0xf5cf, 0xc5ac, 0xd58d, 0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
  0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d,
  0xc7bc, 0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
  0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b, 0x5af5,
  0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
  0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a, 0x6ca6, 0x7c87, 0x4ce4,
  0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
  0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13,
  0x2e32, 0x1e51, 0x0e70, 0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a,
  0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e,
  0xe16f, 0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e, 0x02b1,
  0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb,
  0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d, 0x34e2, 0x24c3, 0x14a0,
  0x0481, 0x7466, 0x6447, 0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8,
  0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657,
  0x7676, 0x4615, 0x5634, 0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9,
  0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882,
  0x28a3, 0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
  0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92, 0xfd2e,
  0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07,
  0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1, 0xef1f, 0xff3e, 0xcf5d,
  0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74,
  0x2e93, 0x3eb2, 0x0ed1, 0x1ef0,
];
