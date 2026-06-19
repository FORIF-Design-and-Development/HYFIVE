import { RouterProvider } from 'react-router';
import { MedicalRecordsProvider } from './context/MedicalRecordsProvider';
import { OnboardingProvider } from './context/OnboardingProvider';
import { router } from './routes';

function App() {
  return (
    <OnboardingProvider>
      <MedicalRecordsProvider>
        <RouterProvider router={router} />
      </MedicalRecordsProvider>
    </OnboardingProvider>
  );
}

export default App;
