export class GameEngine {
  private static instance: GameEngine;

  private readonly version = "1.0.0";
  private readonly worldName = "Stankville";

  private constructor() {}

  public static get(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }

    return GameEngine.instance;
  }

  public initialize(): void {
    console.log(`Starting ${this.worldName}...`);
    console.log(`Engine Version ${this.version}`);
  }

  public getWorldName(): string {
    return this.worldName;
  }

  public getVersion(): string {
    return this.version;
  }

  public heartbeat(): number {
    return Date.now();
  }
}
