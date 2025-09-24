import { evaluate as MathEvaluate } from "mathjs";

class Calculation {
  expression: string | null | undefined = undefined;
  responses: Map<number, number | null> = new Map();

  constructor(
    expression: string | null,
    responses?: Map<number, number | null>,
  ) {
    this.expression = expression;
    if (responses) {
      this.responses = responses;
    }
  }

  public validateExpression(): boolean {
    if (!this.expression) return false;
    const temp = this.expression.replace(/@\[[^\]]+\]\(\d+\)/g, "1");

    try {
      MathEvaluate(temp);
      return true;
    } catch {
      return false;
    }
  }

  public evaluate() {
    if (!this.expression) {
      return null;
    }
    const replacedValues = this.expression.replace(
      /@\[[^\]]+\]\((\d+)\)/g,
      (_, id: string) => {
        return this.findResponse(Number(id));
      },
    );

    try {
      const evaluated = Number(MathEvaluate(replacedValues));
      return Number.isNaN(evaluated) ? null : evaluated;
    } catch (e) {
      return null;
    }
  }

  private findResponse(questionId: number) {
    const response = this.responses.get(questionId);
    if (!response) {
      return "";
    }
    return String(response);
  }
}

export { Calculation };
