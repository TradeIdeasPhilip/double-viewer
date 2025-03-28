import {
  assertClass,
  assertFinite,
  initializedArray,
  NON_BREAKING_SPACE,
  parseFloatX,
  positiveModulo,
  zip,
} from "phil-lib/misc";
import { getById } from "phil-lib/client-misc";
import "./style.css";

/**
 * Add to the end of an element.
 * @param onto Add new html to the end of this element.
 * The new items will be added to the _inside_ of this element.
 * @param html To add.  E.g. `" <button>hi</button> <b>bold</b>""`
 * @returns A list of any and all new childNodes added because of the new HTML string.
 */
function appendFromHTML(onto: HTMLElement, html: string) {
  const lengthBefore = onto.childNodes.length;
  onto.insertAdjacentHTML("beforeend", html);
  const childNodes = onto.childNodes;
  const result = new Array<ChildNode>();
  const lengthNow = onto.childNodes.length;
  for (let i = lengthBefore; i < lengthNow; i++) {
    result.push(childNodes[i]);
  }
  return result;
}
appendFromHTML1;
/**
 * Create a new node from HTML source.
 *
 * This will assert that exactly one new node was created
 * and that the node has the requested type.
 * @param onto Add new html to the end of this element.
 * The new items will be added to the _inside_ of this element.
 * @param html To add.  E.g. `"<button>hi</button>"`
 * @param t The expected return type.  E.g. `HTMLButtonElement`.
 * @returns The newly created node.
 */
function appendFromHTML1<T extends Node>(
  onto: HTMLElement,
  html: string,
  t: { new (): T }
) {
  const results = appendFromHTML(onto, html);
  if (results.length != 1) {
    throw new Error("wtf");
  }
  const result = assertClass(results[0], t);
  return result;
}

/**
 * Add HTML.  Return the new nodes after verifying their types.
 * ```
 * const [, exponentPlusOneButton] = appendFromHTML2(
 *   exponentDiv,
 *   NON_BREAKING_SPACE + "<button>+1</button>",
 *   Text,
 *   HTMLButtonElement
 * );
 * ```
 * @param onto Add new html to the end of this element.
 * The new items will be added to the _inside_ of this element.
 * @param html To add.
 * @param t1 The type of the first node, e.g. `Text`.
 * @param t2 The type of the second node, e.g.
 * @returns The two newly created nodes.
 * @throws An error if the wrong number of nodes are created or they have the wrong types.
 */
function appendFromHTML2<T1 extends Node, T2 extends Node>(
  onto: HTMLElement,
  html: string,
  t1: { new (): T1 },
  t2: { new (): T2 }
): [T1, T2] {
  const results = appendFromHTML(onto, html);
  if (results.length != 2) {
    throw new Error("wtf");
  }
  return [assertClass(results[0], t1), assertClass(results[1], t2)];
}

/**
 * A GUI for interactively inspecting a double precision floating point number.
 */
class DoubleViewer {
  /**
   * This is used to convert between a double and a list of bits.
   */
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
    digitElement.tabIndex = 0;
    return digitElement;
  }
  readonly #digits = initializedArray(64, (index) => this.#makeToggle(index));
  readonly #asString = document.createElement("span");
  readonly #exponentSpan = document.createElement("span");
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

  /**
   * A string of 0's and 1's representing the exponent of the current number.
   */
  get exponentBits() {
    return this.bits.substring(1, 12);
  }
  set exponentBits(newValue) {
    if (!/^[01]{11}$/.test(newValue)) {
      throw new Error("wtf");
    }
    const newFull = [...this.bits]
      .toSpliced(1, newValue.length, ...newValue)
      .join("");
    this.bits = newFull;
    if (this.exponentBits != newValue) {
      throw new Error("wtf");
    }
  }
  /**
   * The largest valid exponent value is EXPONENT_COUNT-1;
   */
  static readonly EXPONENT_COUNT = 2048;
  /**
   * The exponent of this number represented as a positive integer.
   *
   * This is the simplest way to interpret the exponentBits.
   * These are interpreted as an 11 bit unsigned integer.
   *
   * If you try to set this to an integer out of range,
   * the high order bits will be ignored.
   * I.e. viewer.exponent += DoubleViewer.EXPONENT_COUNT is a no-op.
   */
  get exponent(): number {
    const exponent = parseInt(this.exponentBits, 2);
    if (
      !(
        Number.isSafeInteger(exponent) &&
        exponent >= 0 &&
        exponent < DoubleViewer.EXPONENT_COUNT
      )
    ) {
      throw new Error("wtf");
    }
    return exponent;
  }
  set exponent(newValue) {
    if (!Number.isSafeInteger(newValue)) {
      throw new Error("wtf");
    }
    newValue = positiveModulo(newValue, DoubleViewer.EXPONENT_COUNT);
    this.exponentBits = newValue.toString(2).padStart(11, "0");
  }
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
    exponentDiv.style.display = "flex";
    exponentDiv.append(
      "Exponent:" + NON_BREAKING_SPACE + NON_BREAKING_SPACE,
      this.#exponentSpan
    );
    const [, exponentPlusOneButton] = appendFromHTML2(
      exponentDiv,
      NON_BREAKING_SPACE + "<button>+1</button>",
      Text,
      HTMLButtonElement
    );
    const [, exponentMinusOneButton] = appendFromHTML2(
      exponentDiv,
      NON_BREAKING_SPACE + "<button>-1</button>",
      Text,
      HTMLButtonElement
    );
    exponentPlusOneButton.addEventListener("click", () => this.exponent++);
    exponentMinusOneButton.addEventListener("click", () => this.exponent--);

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
    const exponentBits = this.exponentBits;
    if (exponentBits.length != 11) {
      throw new Error("wtf");
    }
    const exponent = this.exponent;
    this.#exponentSpan.innerText = exponent.toLocaleString();
    {
      const mantissaBits = this.bits.substring(12);
      if (mantissaBits.length != 64 - 11 - 1) {
        throw new Error("wtf");
      }
      this.#decimalPointDiv.innerText = "";
      /**
       * If `exponent` == `FAR_LEFT` draw `"1."` immediately before `mantissaBits`.
       */
      const FAR_LEFT = 1023;
      /**
       * If `exponent` == `FAR_RIGHT` draw `"."` immediately after `mantissaBits`.
       */
      const FAR_RIGHT = 1075;
      if (exponent >= FAR_LEFT && exponent <= FAR_RIGHT) {
        this.#decimalPointDiv.appendChild(this.#decimalPointSign).innerText =
          this.bits[0] == "0" ? "+" : "-";
        this.#impliedMantissaDigit.innerText = "1";
        const allMantissaBits = "1" + mantissaBits;
        const fromLeft = exponent - FAR_LEFT;
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
  /**
   * The number to display.
   */
  get value() {
    return this.#value;
  }
  set value(newValue) {
    this.#value = newValue;
    this.#bits = DoubleViewer.toBinary(newValue);
    this.#updateGUI();
  }
  /**
   * The bits used to store this number.
   * This is always a string of 64 0's and 1's.
   */
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
  /**
   * The top level element for this object.
   * Insert this into the document.
   */
  get top() {
    return this.#top;
  }
}

(window as any).DoubleViewer = DoubleViewer;

const doubleViewer = new DoubleViewer(7);
getById("main", HTMLHeadingElement).insertAdjacentElement(
  "afterend",
  doubleViewer.top
);
