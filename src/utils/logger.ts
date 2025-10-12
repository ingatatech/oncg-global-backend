import chalk from 'chalk'

class Logger {
  private log(message: string = '', error?: unknown): void {
    if (message) {
      console.log(message, error ?? '')
    }
  }

  info(message: string): void {
    this.log(chalk.blue(message))
  }

  success(message: string): void {
    this.log(chalk.green(message))
  }

  warn(message: string): void {
    this.log(chalk.yellow(message))
  }

  error(message: string, error?: unknown): void {
    this.log(chalk.red(message), error)
  }
}

export default new Logger()
