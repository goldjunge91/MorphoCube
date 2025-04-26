// Import-Typen aus dem Schema - diese sind für die Drizzle-ORM-Integration
// und werden von den lokalen Interface-Definitionen getrennt gehalten
import { Parameter, Attribute } from "@shared/schema";

// Export der Drizzle-Typen mit eigenen Namen, um Verwechslungen zu vermeiden
export type DbParameter = Parameter;
export type DbAttribute = Attribute;

/**
 * Repräsentiert eine einzelne Ausprägung eines Parameters im morphologischen Kasten
 */
export interface MorphoAttribute {
    id: string;
    name: string;
    description?: string;
    color?: string;
    order: number;
    parameter_id: string;
    // Für die Bewertungsfunktionen
    score?: number;
    feasibility_rating?: number; // Technische Machbarkeit (0-100)
    cost_rating?: number; // Kosteneinschätzung (0-100)
    innovation_rating?: number; // Innovationsgrad (0-100)
    custom_ratings?: Record<string, number>; // Benutzerdefinierte Bewertungskriterien
    metadata?: Record<string, any>; // Zusätzliche Metadaten für erweiterte Funktionen
    created_at: Date;
    updated_at: Date;
}

/**
 * Repräsentiert einen Parameter (Zeile) im morphologischen Kasten
 */
export interface MorphoParameter {
    id: string;
    name: string;
    description?: string;
    color?: string;
    order: number;
    morphological_box_id: string;
    attributes: MorphoAttribute[];
    // Gewichtung des Parameters für Bewertungen
    weight?: number;
    // Parameter-Kategorie für gruppierte Ansichten
    category_id?: string;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

/**
 * Repräsentiert eine Kategorie zur Gruppierung von Parametern
 */
export interface ParameterCategory {
    id: string;
    name: string;
    description?: string;
    color?: string;
    order: number;
    morphological_box_id: string;
    created_at: Date;
    updated_at: Date;
}

/**
 * Repräsentiert einen morphologischen Kasten
 */
export interface MorphologicalBox {
    id: string;
    name: string;
    description?: string;
    is_public: boolean;
    is_template: boolean;
    owner_id: string;
    tenant_id?: string;
    parameters: MorphoParameter[];
    categories?: ParameterCategory[];
    // Für Versionierung
    version: number;
    parent_version_id?: string;
    // Für Teamzusammenarbeit
    collaborators?: Collaborator[];
    tags?: string[];
    // Für branchenspezifische Anpassungen
    industry?: string;
    domain?: string;
    // Metadaten für erweiterte Funktionalität
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

/**
 * Repräsentiert einen Mitarbeiter an einem morphologischen Kasten
 */
export interface Collaborator {
    id: string;
    user_id: string;
    morphological_box_id: string;
    permission: 'read' | 'write' | 'admin';
    created_at: Date;
    updated_at: Date;
}

/**
 * Repräsentiert eine spezifische Lösungskombination
 * (einen "Pfad" durch den morphologischen Kasten)
 */
export interface Solution {
    id: string;
    name: string;
    description?: string;
    morphological_box_id: string;
    created_by_id: string;
    // Array von ausgewählten Attribut-IDs, eine pro Parameter
    selected_attribute_ids: string[];
    // Aggregierte Bewertungen dieser Lösung
    total_score?: number;
    feasibility_score?: number;
    cost_score?: number;
    innovation_score?: number;
    custom_scores?: Record<string, number>;
    notes?: string;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

/**
 * Repräsentiert Kompatibilitätsbeziehungen zwischen Attributen
 * (für Kompatibilitätsmatrizen)
 */
export interface AttributeCompatibility {
    id: string;
    morphological_box_id: string;
    attribute_id_1: string;
    attribute_id_2: string;
    // Kompatibilitätsbewertung (-2: nicht kompatibel bis +2: sehr kompatibel)
    compatibility_score: -2 | -1 | 0 | 1 | 2;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

/**
 * Enum für verschiedene Morphologische-Kasten-Vorlagentypen
 */
export enum TemplateType {
    ENGINEERING_DESIGN = 'engineering_design',
    PRODUCT_DEVELOPMENT = 'product_development',
    STRATEGIC_PLANNING = 'strategic_planning',
    SOFTWARE_ARCHITECTURE = 'software_architecture',
    GENERAL = 'general',
    CUSTOM = 'custom'
}

/**
 * Typ für benutzerdefinierte Bewertungskriterien
 */
export interface CustomCriterion {
    id: string;
    name: string;
    description?: string;
    morphological_box_id: string;
    weight: number;
    min_value: number;
    max_value: number;
    created_at: Date;
    updated_at: Date;
}