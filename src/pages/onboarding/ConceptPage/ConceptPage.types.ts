import type { NavigateFunction } from 'react-router-dom';

export interface ConceptPageTypes {
  navigate: NavigateFunction;
  handleNext: () => void;
  handleSkip: () => void;
}
