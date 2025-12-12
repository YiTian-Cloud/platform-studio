import { Request, Response } from "express";

interface ExampleItem {
  id: string;
  name: string;
}

// In-memory store for demo only
const examples: ExampleItem[] = [];

export class ExampleController {
  list(_req: Request, res: Response) {
    return res.json(examples);
  }

  create(req: Request, res: Response) {
    const name = (req.body && req.body.name) || "example";
    const item: ExampleItem = {
      id: Date.now().toString(),
      name,
    };
    examples.push(item);
    return res.status(201).json(item);
  }
}
