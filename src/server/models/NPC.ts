export interface NPC {
  id: string;
  name: string;

  type:
    | "merchant"
    | "quest"
    | "trainer"
    | "citizen";

  description: string;
}
