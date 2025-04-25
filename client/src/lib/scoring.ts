
import { AttributeCompatibility, CombinationScore, TRIZPrinciple, ParameterWithAttributes } from "@shared/schema";

export class CombinationEvaluator {
  private compatibilityMatrix: Map<string, AttributeCompatibility>;
  private trizPrinciples: TRIZPrinciple[];

  constructor(compatibilityData: AttributeCompatibility[], trizPrinciples: TRIZPrinciple[]) {
    this.compatibilityMatrix = new Map(
      compatibilityData.map(comp => [
        `${comp.attribute1Id}-${comp.attribute2Id}`,
        comp
      ])
    );
    this.trizPrinciples = trizPrinciples;
  }

  evaluateCombination(combination: Record<string, number>, parameters: ParameterWithAttributes[]): CombinationScore {
    const compatibilityScore = this.calculateCompatibilityScore(combination);
    const technicalScore = this.calculateTechnicalScore(combination, parameters);
    const innovationScore = this.calculateInnovationScore(combination);
    const trizScore = this.calculateTRIZScore(combination);
    
    return {
      technicalScore,
      innovationScore,
      compatibilityScore,
      trizScore,
      constraintsSatisfied: this.checkConstraints(combination)
    };
  }

  private calculateCompatibilityScore(combination: Record<string, number>): number {
    let totalScore = 0;
    let pairCount = 0;
    
    const attributeIds = Object.values(combination);
    for (let i = 0; i < attributeIds.length; i++) {
      for (let j = i + 1; j < attributeIds.length; j++) {
        const key1 = `${attributeIds[i]}-${attributeIds[j]}`;
        const key2 = `${attributeIds[j]}-${attributeIds[i]}`;
        
        const compatibility = this.compatibilityMatrix.get(key1) || this.compatibilityMatrix.get(key2);
        if (compatibility) {
          totalScore += compatibility.level;
          pairCount++;
        }
      }
    }
    
    return pairCount > 0 ? (totalScore / pairCount + 2) / 4 * 100 : 50; // Normalize to 0-100
  }

  private calculateTechnicalScore(combination: Record<string, number>, parameters: ParameterWithAttributes[]): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const param of parameters) {
      const weight = param.weight || 5;
      const attributeId = combination[param.name];
      const attribute = param.attributes.find(a => a.id === attributeId);
      
      if (attribute) {
        weightedSum += weight * (attribute.technicalValue || 0.5);
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 50;
  }

  private calculateInnovationScore(combination: Record<string, number>): number {
    // Implement innovation scoring based on novelty and market potential
    return Math.random() * 100; // Placeholder
  }

  private calculateTRIZScore(combination: Record<string, number>): number {
    let trizApplicability = 0;
    const attributeIds = Object.values(combination);
    
    for (const principle of this.trizPrinciples) {
      const applicableAttributes = principle.applicableToAttributeIds
        .filter(id => attributeIds.includes(id));
      
      if (applicableAttributes.length > 0) {
        trizApplicability += applicableAttributes.length;
      }
    }
    
    return Math.min((trizApplicability / attributeIds.length) * 100, 100);
  }

  private checkConstraints(combination: Record<string, number>): boolean {
    // Implement constraint checking logic
    return true; // Placeholder
  }
}
