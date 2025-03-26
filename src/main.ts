// This is the preferred way to include a css file.
import {
  assertFinite,
  initializedArray,
  NON_BREAKING_SPACE,
  parseFloatX,
  zip,
} from "phil-lib/misc";
import "./style.css";

class DoubleViewer {
  static #dataView = new DataView(
    new ArrayBuffer(Float64Array.BYTES_PER_ELEMENT)
  );
  static toBinary(x: number): string {
    const littleEndian = false;
    const separator = "";
    const radix = 2;
    const dataView = DoubleViewer.#dataView;
    dataView.setFloat64(0, x, littleEndian);
    const bytes = initializedArray(Float64Array.BYTES_PER_ELEMENT, (i) =>
      dataView.getUint8(i).toString(radix).padStart(8, "0")
    );
    return bytes.join(separator);
  }
  static fromBinary(s: string) {
    if (s.length != 64) {
      return undefined;
    }
    for (const c of s) {
      if (c != "0" && c != "1") {
        return undefined;
      }
    }
    const dataView = DoubleViewer.#dataView;
    for (let byteNumber = 0; byteNumber < 8; byteNumber++) {
      const byteAsSting = s.substring(byteNumber * 8, (byteNumber + 1) * 8);
      const byte = parseInt(byteAsSting, 2);
      dataView.setUint8(byteNumber, byte);
    }
    const littleEndian = false;
    const result = dataView.getFloat64(0, littleEndian);
    return result;
  }
  #value: number;
  #bits: string;
  readonly #top = document.createElement("div");
  #makeToggle(bitIndex: number) {
    const digitElement = document.createElement("span");
    digitElement.addEventListener("pointerdown", () => {
      const bits = [...this.bits];
      const oldBit = bits[bitIndex];
      const newBit = oldBit == "0" ? "1" : "0";
      bits[bitIndex] = newBit;
      this.bits = bits.join("");
    });
    digitElement.dataset.digit = bitIndex.toString();
    return digitElement;
  }
  readonly #digits = initializedArray(64, (index) => this.#makeToggle(index));
  readonly #asString = document.createElement("span");
  readonly #rawExponentSpan = document.createElement("span");
  readonly #rawMantissaSpan = document.createElement("span");
  readonly #decimalPointDiv = document.createElement("div");
  readonly #duplicateMantissaDigits = initializedArray(52, (index) =>
    this.#makeToggle(index + 12)
  );
  readonly #impliedMantissaDigit = document.createElement("span");
  readonly #completeMantissa = [
    this.#impliedMantissaDigit,
    ...this.#duplicateMantissaDigits,
  ];
  readonly #decimalPointSign = this.#makeToggle(0);
  readonly #decimalPoint = document.createElement("span");
  readonly #input = document.createElement("input");

  constructor(initialValue = 0) {
    this.#value = initialValue;
    this.#bits = DoubleViewer.toBinary(initialValue);
    this.#decimalPoint.classList.add("exponent", "fixed-width");
    this.#decimalPoint.innerText = ".";
    this.#decimalPointDiv.style.wordBreak = "break-all";
    this.#impliedMantissaDigit.classList.add("fixed-width", "exponent");
    const digitHolder = document.createElement("div");
    digitHolder.style.wordBreak = "break-all";
    digitHolder.append(...this.#digits);
    const valueDiv = document.createElement("div");
    valueDiv.append(
      "Value:" + NON_BREAKING_SPACE + NON_BREAKING_SPACE,
      this.#asString
    );
    this.#asString.classList.add("bits-as-string");
    const exponentDiv = document.createElement("div");
    exponentDiv.classList.add("exponent");
    exponentDiv.append(
      "Raw Exponent:" + NON_BREAKING_SPACE + NON_BREAKING_SPACE,
      this.#rawExponentSpan
    );
    const mantissaDiv = document.createElement("div");
    mantissaDiv.classList.add("mantissa");
    mantissaDiv.append(
      "Raw Mantissa:" + NON_BREAKING_SPACE + NON_BREAKING_SPACE,
      this.#rawMantissaSpan
    );
    //this.#rawMantissaSpan.classList.add("fixed-width");

    const setValueDiv = document.createElement("div");
    {
      const getValue = () => {
        return parseFloatX(this.#input.value) ?? NaN;
      };
      let button = document.createElement("button");
      button.innerText = "=";
      button.addEventListener("click", () => {
        this.value = getValue();
      });
      setValueDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "+=";
      button.addEventListener("click", () => {
        this.value += getValue();
      });
      setValueDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "-=";
      button.addEventListener("click", () => {
        this.value -= getValue();
      });
      setValueDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "*=";
      button.addEventListener("click", () => {
        this.value *= getValue();
      });
      setValueDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "/=";
      button.addEventListener("click", () => {
        this.value /= getValue();
      });
      setValueDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "%=";
      button.addEventListener("click", () => {
        this.value %= getValue();
      });
      setValueDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "^=";
      button.addEventListener("click", () => {
        this.value ^= getValue();
      });
      setValueDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "&=";
      button.addEventListener("click", () => {
        this.value &= getValue();
      });
      setValueDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "|=";
      button.addEventListener("click", () => {
        this.value |= getValue();
      });
      setValueDiv.append(button, " ");
    }
    setValueDiv.appendChild(this.#input);

    const moreButtonsDiv = document.createElement("div");
    {
      let button = document.createElement("button");
      button.innerText = "NaN";
      button.addEventListener("click", () => (this.value = NaN));
      moreButtonsDiv.append("= ", button);
      button = document.createElement("button");
      button.innerText = "-Infinity";
      button.addEventListener("click", () => (this.value = -Infinity));
      moreButtonsDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Min Safe Integer";
      button.addEventListener(
        "click",
        () => (this.value = Number.MIN_SAFE_INTEGER)
      );
      moreButtonsDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Min Value";
      button.addEventListener("click", () => (this.value = Number.MIN_VALUE));
      moreButtonsDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Epsilon";
      button.addEventListener("click", () => (this.value = Number.EPSILON));
      moreButtonsDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Max Safe Integer";
      button.addEventListener(
        "click",
        () => (this.value = Number.MAX_SAFE_INTEGER)
      );
      moreButtonsDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Max Value";
      button.addEventListener("click", () => (this.value = Number.MAX_VALUE));
      moreButtonsDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Infinity";
      button.addEventListener("click", () => (this.value = Infinity));
      moreButtonsDiv.append(" ", button);
    }

    this.#top.appendChild(digitHolder);
    this.#top.appendChild(valueDiv);
    this.#top.appendChild(exponentDiv);
    this.#top.appendChild(mantissaDiv);
    this.#top.appendChild(this.#decimalPointDiv);
    this.#top.appendChild(setValueDiv);
    this.#top.appendChild(moreButtonsDiv);
    this.#top.classList.add("top");
    this.#updateGUI();
  }
  #updateGUI() {
    for (const [bit, element] of zip(this.bits, this.#digits)) {
      element.innerText = bit;
    }
    this.#asString.innerText = this.value.toString();
    const exponentBits = this.bits.substring(1, 12);
    if (exponentBits.length != 11) {
      throw new Error("wtf");
    }
    const rawExponent = parseInt(exponentBits, 2);
    this.#rawExponentSpan.innerText = rawExponent.toLocaleString();
    {
      const mantissaBits = this.bits.substring(12);
      if (mantissaBits.length != 64 - 11 - 1) {
        throw new Error("wtf");
      }
      const rawMantissa = parseInt(mantissaBits, 2);
      this.#rawMantissaSpan.innerText = rawMantissa.toLocaleString();
      this.#decimalPointDiv.innerText = "";
      /**
       * If `rawExponent` == `FAR_LEFT` draw `"1."` immediately before `mantissaBits`.
       */
      const FAR_LEFT = 1023;
      /**
       * If `rawExponent` == `FAR_RIGHT` draw `"."` immediately after `mantissaBits`.
       */
      const FAR_RIGHT = 1075;
      if (rawExponent >= FAR_LEFT && rawExponent <= FAR_RIGHT) {
        this.#decimalPointDiv.appendChild(this.#decimalPointSign).innerText =
          this.bits[0] == "0" ? "+" : "-";
        this.#impliedMantissaDigit.innerText = "1";
        const allMantissaBits = "1" + mantissaBits;
        const fromLeft = rawExponent - FAR_LEFT;
        let trailingZerosStartAfter = NaN;
        this.#completeMantissa.forEach((span, index) => {
          const bit = allMantissaBits[index];
          this.#decimalPointDiv.appendChild(span).innerText = bit;
          if (bit == "1") {
            trailingZerosStartAfter = index;
          }
          // decide which digits are trailing zeros.
          if (index == fromLeft) {
            this.#decimalPointDiv.appendChild(this.#decimalPoint);
            trailingZerosStartAfter = index;
          }
        });
        assertFinite(trailingZerosStartAfter);
        this.#completeMantissa.forEach((span, index) => {
          const isTrailingZero = index > trailingZerosStartAfter;
          const weight = isTrailingZero ? "100" : "";
          span.style.fontWeight = weight;
        });
        console.log("trailingZerosStartAfter", trailingZerosStartAfter);
      }
    }
  }
  get value() {
    return this.#value;
  }
  set value(newValue) {
    this.#value = newValue;
    this.#bits = DoubleViewer.toBinary(newValue);
    this.#updateGUI();
  }
  get bits() {
    return this.#bits;
  }
  set bits(newValue) {
    const asDouble = DoubleViewer.fromBinary(newValue);
    if (asDouble === undefined) {
      throw new Error("invalid");
    }
    this.value = asDouble;
    if (newValue != this.bits) {
      console.info(newValue, this.bits);
    }
  }
  get top() {
    return this.#top;
  }
}

(window as any).DoubleViewer = DoubleViewer;

const doubleViewer = new DoubleViewer(7);
document.body.appendChild(doubleViewer.top);

//Raw Exponent:  1075 -->
// Put the decimal point to the far right side of the mantissa.
