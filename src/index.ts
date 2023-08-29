import crc16ccitt from "crc/crc16ccitt";

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
      const regex = /^[a-zA-Z0-9 ]{1,25}$/;
      if (!regex.test(message)) {
        throw Error(
          "Message max 25 characters or only letters and numbers and space."
        );
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

    let crc = crc16ccitt(value).toString(16);
    if (crc.length === 3) {
      crc = `0${crc}`;
    }

    return `${value}${crc.toLocaleUpperCase()}`;
  }
}
