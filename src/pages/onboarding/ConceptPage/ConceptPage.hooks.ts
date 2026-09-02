import { useNavigate } from 'react-router-dom';
import type { ConceptPageTypes } from './ConceptPage.types';

export const useConceptPage = (): ConceptPageTypes => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/onboarding/cuentas');
  };

  const handleSkip = () => {
    navigate('/');
  };

  return {
    navigate,
    handleNext,
    handleSkip,
  };
};
