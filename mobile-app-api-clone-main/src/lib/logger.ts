import fs from 'fs';
import moment from 'moment';

export class Logger {
  /* core-oriented */
  /* user view-oriented */

  /* Chron */
  initiateDay() {
    /* Usage */
    const typeLog = ['info', 'debug', 'warning', 'error'];
    const locale = moment().utc().format('DD-MM-YYYY');

    typeLog.forEach(type => {
      fs.writeFileSync(`src/log/${type}_${locale}.txt`, ``);
    });

    return true;
  }

  /* Methode */
  error({ message }: any) {
    /* Usage */
    // logError({
    //     message: <error description :string>
    // })

    this.#updateLog({ typeLog: 'error', content: message });

    return true;
  }
  info({ message }: any) {
    /* Usage */
    // logInfo({
    //     message: <error description :string>
    // })

    this.#updateLog({ typeLog: 'info', content: message });

    return true;
  }
  debug({ message }: any) {
    /* Usage */
    // logDebug({
    //     message: <error description :string>
    // })

    this.#updateLog({ typeLog: 'debug', content: message });

    return true;
  }
  warning({ message }: any) {
    /* Usage */
    // logWarning({
    //     message: <error description :string>
    // })

    this.#updateLog({ typeLog: 'warning', content: message });

    return true;
  }

  /* Engine */
  #updateLog({ typeLog, content }: any) {
    /* Usage */
    // updateLog({
    //   typeLog: <"error"|"info"|"debug"|"warning" :String>,
    //   content: <thrower message :String>
    // })

    const now: any = moment().utc().format('DD-MM-YYYY:HH:mm:SS');
    const nowat = moment().utc().format('DD-MM-YYYY');

    if (!fs.existsSync(`src/log/${typeLog}_${nowat}.txt`)) {
      this.initiateDay();
    }

    fs.appendFile(`src/log/error_${nowat}.txt`, `[${now}] ${content}\n`, err => {
      if (err) return false;
    });

    return true;
  }
}

const inst = new Logger();
export default inst;
