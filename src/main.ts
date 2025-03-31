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
  /**
   * Convert the number into a 32 bit floating point number,
   * and then back to a 64 bit floating point number.
   * @param x
   * @returns
   */
  static toFloat(x: number) {
    this.#dataView.setFloat32(0, x);
    return this.#dataView.getFloat32(0);
  }
  /*
  static toFloat16(x: number) {
    // This does not work on chrome.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setFloat16
    this.#dataView.setFloat16(0, x);
    return this.#dataView.getFloat16(0);
  }
  */
  #value: number;
  #bits: string;
  readonly #top = document.createElement("div");
  #makeToggle(bitIndex: number) {
    const digitElement = document.createElement("span");
    const toggleBit = () => {
      const bits = [...this.bits];
      const oldBit = bits[bitIndex];
      const newBit = oldBit == "0" ? "1" : "0";
      bits[bitIndex] = newBit;
      this.bits = bits.join("");
    };
    digitElement.addEventListener("pointerdown", toggleBit);
    digitElement.addEventListener("keypress", (event) => {
      if (event.key == " " || event.key == "Enter") {
        toggleBit();
        event.stopPropagation();
      }
    });
    digitElement.style.cursor = "pointer";
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
    this.#decimalPoint.classList.add("exponent");
    this.#decimalPoint.dataset["digit"] = "x";
    this.#decimalPoint.innerText = ".";
    const leftSide = (event: MouseEvent) => {
      const { left, width } = this.#decimalPoint.getBoundingClientRect();
      const x = event.clientX;
      return x < left + width / 2;
    };
    const updateCursor = (event: MouseEvent) => {
      this.#decimalPoint.style.cursor = leftSide(event)
        ? "w-resize"
        : "e-resize";
    };
    this.#decimalPoint.addEventListener("mouseenter", updateCursor);
    this.#decimalPoint.addEventListener("mouseleave", updateCursor);
    this.#decimalPoint.addEventListener("mousemove", updateCursor);
    this.#decimalPoint.addEventListener("click", (event) => {
      if (leftSide(event)) {
        this.exponent--;
      } else {
        this.exponent++;
      }
    });
    this.#decimalPointDiv.style.wordBreak = "break-all";
    this.#impliedMantissaDigit.classList.add("exponent");
    this.#impliedMantissaDigit.dataset["digit"] = "x";
    const digitHolder = document.createElement("div");
    digitHolder.style.wordBreak = "break-all";
    digitHolder.append(...this.#digits);
    const valueDiv = document.createElement("div");
    valueDiv.append(
      "Value:" + NON_BREAKING_SPACE + NON_BREAKING_SPACE,
      this.#asString
    );
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
    /**
     * The user can `<input>` a number, and then apply `=`, `+=`, etc from the buttons.
     * JavaScript calls these [assignment operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators#assignment_operators).
     */
    const assignmentOperatorsDiv = document.createElement("div");
    {
      const getValue = () => {
        return parseFloatX(this.#input.value) ?? NaN;
      };
      let button = document.createElement("button");
      button.innerText = "=";
      button.addEventListener("click", () => {
        this.value = getValue();
      });
      assignmentOperatorsDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "+=";
      button.addEventListener("click", () => {
        this.value += getValue();
      });
      assignmentOperatorsDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "-=";
      button.addEventListener("click", () => {
        this.value -= getValue();
      });
      assignmentOperatorsDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "*=";
      button.addEventListener("click", () => {
        this.value *= getValue();
      });
      assignmentOperatorsDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "/=";
      button.addEventListener("click", () => {
        this.value /= getValue();
      });
      assignmentOperatorsDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "%=";
      button.addEventListener("click", () => {
        this.value %= getValue();
      });
      assignmentOperatorsDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "^=";
      button.addEventListener("click", () => {
        this.value ^= getValue();
      });
      assignmentOperatorsDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "&=";
      button.addEventListener("click", () => {
        this.value &= getValue();
      });
      assignmentOperatorsDiv.append(button, " ");
      button = document.createElement("button");
      button.innerText = "|=";
      button.addEventListener("click", () => {
        this.value |= getValue();
      });
      assignmentOperatorsDiv.append(button, " ");
    }
    assignmentOperatorsDiv.appendChild(this.#input);
    this.#input.value = "2";
    /**
     * These buttons set the value to -Infinity, Number.MAX_SAFE_INTEGER, etc.
     */
    const setSpecificValuesDiv = document.createElement("div");
    {
      let button = document.createElement("button");
      button.innerText = "NaN";
      button.addEventListener("click", () => (this.value = NaN));
      setSpecificValuesDiv.append("= ", button);
      button = document.createElement("button");
      button.innerText = "-Infinity";
      button.addEventListener("click", () => (this.value = -Infinity));
      setSpecificValuesDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Min Safe Integer";
      button.addEventListener(
        "click",
        () => (this.value = Number.MIN_SAFE_INTEGER)
      );
      setSpecificValuesDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Min Value";
      button.addEventListener("click", () => (this.value = Number.MIN_VALUE));
      setSpecificValuesDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Epsilon";
      button.addEventListener("click", () => (this.value = Number.EPSILON));
      setSpecificValuesDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Max Safe Integer";
      button.addEventListener(
        "click",
        () => (this.value = Number.MAX_SAFE_INTEGER)
      );
      setSpecificValuesDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Max Value";
      button.addEventListener("click", () => (this.value = Number.MAX_VALUE));
      setSpecificValuesDiv.append(" ", button);
      button = document.createElement("button");
      button.innerText = "Infinity";
      button.addEventListener("click", () => (this.value = Infinity));
      setSpecificValuesDiv.append(" ", button);
    }
    /**
     * 1/x, convert to float32
     */
    const moreMutatorsDiv = document.createElement("div");
    {
      moreMutatorsDiv.style.display = "flex";
      moreMutatorsDiv.style.gap = "0.25em";
      moreMutatorsDiv.style.padding = "0.25em 0";
      const reciprocalButton = appendFromHTML1(
        moreMutatorsDiv,
        "<button>1/x</button>",
        HTMLButtonElement
      );
      reciprocalButton.addEventListener(
        "click",
        () => (this.value = 1 / this.value)
      );
      const float32Button = appendFromHTML1(
        moreMutatorsDiv,
        "<button>32 Bits</button>",
        HTMLButtonElement
      );
      float32Button.addEventListener("click", () => {
        this.value = DoubleViewer.toFloat(this.value);
      });
    }
    this.#top.appendChild(valueDiv);
    this.#top.appendChild(digitHolder);
    this.#top.appendChild(exponentDiv);
    this.#top.appendChild(this.#decimalPointDiv);
    this.#top.appendChild(assignmentOperatorsDiv);
    this.#top.appendChild(setSpecificValuesDiv);
    this.#top.appendChild(moreMutatorsDiv);
    this.#top.classList.add("top");
    this.#updateGUI();
  }
  #updateGUI() {
    for (const [bit, element] of zip(this.bits, this.#digits)) {
      element.innerText = bit;
    }
    /**
     * Convert the input to a string.
     * Add commas if the number is not in scientific notation.
     * @param x Convert this to a string.
     * @returns The number as a string.
     */
    function commaFriendly(x: number) {
      return x.toString();
      if (Math.abs(x) <= Number.MAX_SAFE_INTEGER) {
        // Adds commas and prevents scientific notation.
        // However, that makes it limit precision to three digits after the decimal.
        // I tried to adjust that, but that caused other problems.
        return x.toLocaleString();
      } else {
        return x.toExponential();
      }
    }
    this.#asString.innerText = commaFriendly(this.value);
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
      if (exponent == DoubleViewer.EXPONENT_COUNT - 1) {
        this.#decimalPointDiv.innerText = "Infinity or NaN";
      } else {
        this.#decimalPointDiv.appendChild(this.#decimalPointSign).innerText =
          this.bits[0] == "0" ? "+" : "-";
        if (exponent == 0) {
          const allMantissaBits = "0" + mantissaBits;
          this.#impliedMantissaDigit.innerText = "0";
          // de-normal
          // draw a black 0
          //this.#decimalPointDiv.append("0");
          appendFromHTML(
            this.#decimalPointDiv,
            '<span data-digit="x">0</span>'
          );
          // draw the red .
          this.#decimalPointDiv.appendChild(this.#decimalPoint);
          // draw "0…0" in black.
          //this.#decimalPointDiv.append("0…0");
          appendFromHTML(
            this.#decimalPointDiv,
            '<span data-digit="x">0…0</span>'
          );
          // Draw 0 in red. And draw the green mantissa.
          this.#completeMantissa.forEach((span, index) => {
            const bit = allMantissaBits[index];
            this.#decimalPointDiv.appendChild(span).innerText = bit;
            span.style.fontWeight = "";
          });
        } else {
          const allMantissaBits = "1" + mantissaBits;
          this.#impliedMantissaDigit.innerText = "1";
          if (exponent > FAR_RIGHT) {
            const howFarPast = exponent - FAR_RIGHT;
            // Draw 1 in red. And draw the green mantissa.
            this.#completeMantissa.forEach((span, index) => {
              const bit = allMantissaBits[index];
              this.#decimalPointDiv.appendChild(span).innerText = bit;
              span.style.fontWeight = "";
            });
            //  draw ?, ??, ???, or ?…?
            const placeholders =
              //            howFarPast > 3 ? "?…?" : "?".repeat(howFarPast);
              howFarPast > 3 ? "0…0" : "0".repeat(howFarPast);
            appendFromHTML(
              this.#decimalPointDiv,
              `<span data-digit="x">${placeholders}</span>`
            );
            // draw the red period.
            this.#decimalPointDiv.appendChild(this.#decimalPoint);
          } else if (exponent >= FAR_LEFT) {
            const fromLeft = exponent - FAR_LEFT;
            let trailingZerosStartAfter = NaN;
            this.#completeMantissa.forEach((span, index) => {
              const bit = allMantissaBits[index];
              this.#decimalPointDiv.appendChild(span).innerText = bit;
              if (bit == "1") {
                trailingZerosStartAfter = index;
              }
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
          } else {
            const howFarPast = FAR_LEFT - exponent;
            // draw a black 0
            appendFromHTML(
              this.#decimalPointDiv,
              '<span data-digit="x">0</span>'
            );
            // draw the red .
            this.#decimalPointDiv.appendChild(this.#decimalPoint);
            // draw (howFarPast-1) black zeros
            // or "0…0" if howFarPast >3
            const leadingZeros =
              howFarPast > 3 ? "0…0" : "0".repeat(howFarPast - 1);
            appendFromHTML(
              this.#decimalPointDiv,
              `<span data-digit="x">${leadingZeros}</span>`
            );
            // Draw 1 in red. And draw the green mantissa.
            let trailingZerosStartAfter = NaN;
            this.#completeMantissa.forEach((span, index) => {
              const bit = allMantissaBits[index];
              this.#decimalPointDiv.appendChild(span).innerText = bit;
              if (bit == "1") {
                trailingZerosStartAfter = index;
              }
              span.style.fontWeight = "";
            });
            assertFinite(trailingZerosStartAfter);
            this.#completeMantissa.forEach((span, index) => {
              const isTrailingZero = index > trailingZerosStartAfter;
              const weight = isTrailingZero ? "100" : "";
              span.style.fontWeight = weight;
            });
          }
        }
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

const doubleViewer = new DoubleViewer(3.5);
getById("main", HTMLHeadingElement).insertAdjacentElement(
  "afterend",
  doubleViewer.top
);
