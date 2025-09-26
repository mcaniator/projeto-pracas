import { evaluate as MathEvaluate } from "mathjs";

class Calculation {
  idRegex = /@\[[^\]]+\]\((\d+)\)/g;
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
      this.idRegex,
      (_, id: string) => {
        return this.findResponse(Number(id));
      },
    );

    try {
      if (replacedValues.trim() == "null") {
        return null;
      }
      const evaluated = Number(MathEvaluate(replacedValues));
      return Number.isNaN(evaluated) ? null : evaluated;
    } catch (e) {
      return null;
    }
  }

  public getExpressionQuestionIds() {
    if (!this.expression) return [];
    const matches = Array.from(this.expression.matchAll(this.idRegex));
    return matches.map((m) => {
      const id = m[1];
      if (!id || id.length === 0) {
        throw new Error("Error getting id");
      }
      return Number(id);
    });
  }

  private findResponse(questionId: number) {
    const response = this.responses.get(questionId);
    if (!response == null) {
      return "";
    }
    return String(response);
  }
}

export { Calculation };
