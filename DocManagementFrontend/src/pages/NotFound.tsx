
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DocuVerseLogo from '@/components/DocuVerseLogo';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center w-full max-w-md">
        <DocuVerseLogo className="mx-auto h-10 md:h-12 w-auto mb-6 md:mb-8" />
        <h1 className="text-7xl md:text-9xl font-bold text-docuBlue">404</h1>
        <h2 className="mt-4 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Page not found</h2>
        <p className="mt-2 text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <div className="mt-6 md:mt-8">
          <Link to="/">
            <Button className="bg-docuBlue hover:bg-docuBlue-700 px-6 py-2 md:py-3 text-base md:text-lg">
              Return to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
