import { RouterProvider } from 'react-router';
import { OnboardingProvider } from './context/OnboardingProvider';
import { router } from './routes';

function App() {
  return (
    <OnboardingProvider>
      <RouterProvider router={router} />
    </OnboardingProvider>
  );
}

export default App;
