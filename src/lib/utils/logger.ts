import { blue, gray, magenta, red, redBright, white, yellow, type Color } from "colorette";
import { format, inspect } from "node:util";
import { Console } from "node:console";
import dayjs from "dayjs";
import timeZone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);
dayjs.extend(timeZone);

export class Logger {
    /**
     * The console this writes to.
     * @since 1.0.0
     */
    public readonly console: Console;

    /**
     * The depth of the inspect.
     */
    public readonly level: Logger.Level;

    /**
     * The inspect depth when logging objects.
     */
    public readonly depth: number;

    /**
     * The context for each logging level.
     */
    public readonly levels: Map<Logger.Level, Logger.LevelContext>;

    public constructor(options: Logger.Options = {}) {
        this.console = new Console(process.stdout, process.stderr);
        this.level = options.level ?? Logger.Level.None;
        this.depth = options.depth ?? 0;
        this.levels = new Map<Logger.Level, Logger.LevelContext>([
            [Logger.Level.None, { color: white, method: "info", name: "" }],
            [Logger.Level.Trace, { color: gray, method: "trace", name: "TRACE" }],
            [Logger.Level.Debug, { color: magenta, method: "debug", name: "DEBUG" }],
            [Logger.Level.Info, { color: blue, method: "info", name: "INFO" }],
            [Logger.Level.Warn, { color: yellow, method: "warn", name: "WARN" }],
            [Logger.Level.Error, { color: red, method: "error", name: "ERROR" }],
            [Logger.Level.Fatal, { color: redBright, method: "error", name: "FATAL" }],
        ]);
    }

    public enabled(level: Logger.Level): boolean {
        return level >= this.level;
    }

    public disabled(level: Logger.Level): boolean {
        return level < this.level;
    }

    public trace(value: unknown, ...args: readonly unknown[]): void {
        if (this.enabled(Logger.Level.Trace)) this.write(this.levels.get(Logger.Level.Trace) as Logger.LevelContext, value, args);
    }

    public debug(value: unknown, ...args: readonly unknown[]): void {
        if (this.enabled(Logger.Level.Debug)) this.write(this.levels.get(Logger.Level.Debug) as Logger.LevelContext, value, args);
    }

    public info(value: unknown, ...args: readonly unknown[]): void {
        if (this.enabled(Logger.Level.Info)) this.write(this.levels.get(Logger.Level.Info) as Logger.LevelContext, value, args);
    }

    public warn(value: unknown, ...args: readonly unknown[]): void {
        if (this.enabled(Logger.Level.Warn)) this.write(this.levels.get(Logger.Level.Warn) as Logger.LevelContext, value, args);
    }

    public error(value: unknown, ...args: readonly unknown[]): void {
        if (this.enabled(Logger.Level.Error)) this.write(this.levels.get(Logger.Level.Error) as Logger.LevelContext, value, args);
    }

    public fatal(value: unknown, ...args: readonly unknown[]): void {
        if (this.enabled(Logger.Level.Fatal)) this.write(this.levels.get(Logger.Level.Fatal) as Logger.LevelContext, value, args);
    }

    private write(context: Logger.LevelContext, value: unknown, args: readonly unknown[]): void {
        const header = `[${context.color(this.time)}] ${context.color(context.name.padEnd(5))} : `;
        const formatted = typeof value === "string" ? format(value, ...args) : inspect(value, { colors: true });

        this.console[context.method](`${header}${formatted.replace(/\\n/g, `\n${header}`)}`);
    }

    private get time() {
        return dayjs().tz("asia/kuala_lumpur").format("YYYY-MM-DD HH:mm:ss");
    }
}

export namespace Logger {
    export interface Options {
        level?: Level;
        depth?: number;
        levels?: Partial<Record<Level, LevelContext>>;
    }

    export const enum Level {
        None,
        Trace,
        Debug,
        Info,
        Warn,
        Error,
        Fatal,
    }

    export interface LevelContext {
        color: Color;
        name: string;
        method: Method;
    }

    export interface Format {
        (value: string): string;
    }

    export type Method = "debug" | "error" | "info" | "trace" | "warn";
}
