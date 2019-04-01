
const enum LogLevels {
  Trace,
  Debug,
  Log,
  Info,
  Warning,
  Error
}

// tslint:disable-next-line:no-unnecessary-class
export class Logger {
  private static outletStack: Array<HTMLDivElement> = [];

  public static debug(message?: any, ...optionalParams: Array<any>): void {
    Logger.outputMessage(LogLevels.Debug, message, optionalParams);
    console.debug(message, ...optionalParams);
  }

  public static error(message?: any, ...optionalParams: Array<any>): void {
    Logger.outputMessage(LogLevels.Error, message, optionalParams);
    console.error(message, ...optionalParams);
  }

  public static info(message?: any, ...optionalParams: Array<any>): void {
    Logger.outputMessage(LogLevels.Info, message, optionalParams);
    console.info(message, ...optionalParams);
  }

  public static log(message?: any, ...optionalParams: Array<any>): void {
    Logger.outputMessage(LogLevels.Log, message, optionalParams);
    console.log(message, ...optionalParams);
  }

  public static trace(message?: any, ...optionalParams: Array<any>): void {
    Logger.outputMessage(LogLevels.Trace, message, optionalParams);
    console.trace(message, ...optionalParams);
  }

  public static warn(message?: any, ...optionalParams: Array<any>): void {
    Logger.outputMessage(LogLevels.Warning, message, optionalParams);
    console.warn(message, ...optionalParams);
  }

  public static group(groupTitle?: string, ...optionalParams: Array<any>): void {
    Logger.createDivForGroup(groupTitle || 'New Group');
    console.group(groupTitle, ...optionalParams);
  }

  public static groupCollapsed(groupTitle?: string, ...optionalParams: Array<any>): void {
    Logger.createDivForGroup(groupTitle || 'New Group');
    console.group(groupTitle, ...optionalParams);
  }

  public static groupEnd(): void {
    this.outletStack.pop();
    console.groupEnd();
  }

  private static outputMessage(level: LogLevels, message: any, optionalParams: Array<any>): void {
    // Outer container for all spans
    const containerDiv = Logger.createDiv();
    Logger.outletStack.push(containerDiv);

    // Create msg span
    let span = Logger.createSpan();

    // Set the container style based on level
    switch (level) {
      case LogLevels.Error:
        containerDiv.style.cssText = 'color:red; background-color:#fff0f0';
        span.innerHTML = '&#9940; ';
        span = Logger.createSpan();
        break;

      case LogLevels.Warning:
        containerDiv.style.cssText = 'color:#5c3c00; background-color:#fffbe5';
        span.innerHTML = '&#9888; ';
        span = Logger.createSpan();
        break;

      default:
        break;
    }

    // Copy params
    const paramsCpy = [...optionalParams];

    // Copy message
    let msgCopy = message;

    if (typeof msgCopy === 'string') {
      // Look for control codes
      const ctrlCodeRegEx = /%./g;
      let lastMatchIdx = 0;

      let match: RegExpExecArray | null = ctrlCodeRegEx.exec(msgCopy);
      while (match) {
        // Extract the code
        const code = msgCopy.slice(match.index + 1, match.index + 2);

        switch (code) {
          case 'c': // Style
            // Fill and end the current span
            span.innerText += msgCopy.slice(lastMatchIdx, match.index);
            // Create a new span with the style
            span = Logger.createSpan();
            span.style.cssText = paramsCpy.shift();
            // Move last match
            lastMatchIdx = match.index + 2;
            break;

          case 's': // String
            // Append with current span
            span.innerText += `${msgCopy.slice(lastMatchIdx, match.index)}${String(paramsCpy.shift())}`;
            // Move last match
            lastMatchIdx = match.index + 2;
            break;

          default:
            // Unsupported: d,f,i,o,O
            break;
        }
        match = ctrlCodeRegEx.exec(msgCopy);
      }

      // Reduce msg to text after last match
      msgCopy = msgCopy.slice(lastMatchIdx);
    }

    // Fill the current span with the message
    span.innerText += String(msgCopy);

    // Create a span for each param
    paramsCpy
      .map(String)
      .forEach((p) => {
        span = Logger.createSpan();
        span.innerText = ` ${p}`;
      });

    Logger.outletStack.pop();
  }

  private static getOutlet(): HTMLElement {
    return Logger.outletStack[Logger.outletStack.length - 1] || document.getElementById('TestResults');
  }

  private static createDiv(): HTMLDivElement {
    const newDiv = document.createElement('div');
    return Logger.getOutlet()
      .appendChild(newDiv);
  }

  private static createHeader(title: string): void {
    const newHeader = document.createElement('h3');
    newHeader.innerText = title;
    Logger.getOutlet()
      .appendChild(newHeader);
  }

  private static createSpan(): HTMLSpanElement {
    const newSpan = document.createElement('span');
    return Logger.getOutlet()
      .appendChild(newSpan);
  }

  private static createDivForGroup(groupTitle: string): void {
    Logger.createHeader(groupTitle);
    const div = Logger.createDiv();
    div.classList.add('groupdiv');
    Logger.outletStack.push(div);
  }

}
