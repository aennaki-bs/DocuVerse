import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DocuVerseLogo from "@/components/DocuVerseLogo";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <DocuVerseLogo className="h-10 w-auto" />
              </div>
            </div>
            <div className="flex items-center">
              <Link to="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button className="ml-4 bg-docuBlue hover:bg-docuBlue-700">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl animate-slide-up">
                <span className="block">Manage your documents</span>
                <span className="block text-docuBlue">with DocuVerse</span>
              </h1>
              <p
                className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                Secure, organize, and collaborate on all your documents in one
                place. Take control of your document workflow today.
              </p>
              <div
                className="mt-10 space-x-4 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <Link to="/register">
                  <Button className="bg-docuBlue hover:bg-docuBlue-700 shadow-lg hover:shadow-xl transition-all py-3 px-8 rounded-lg text-lg">
                    Get Started for Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="ml-4 py-3 px-8 rounded-lg text-lg"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Why Choose DocuVerse?
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                Everything you need to manage your documents efficiently
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="bg-docuBlue-100 dark:bg-blue-900 rounded-lg p-3 inline-block mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-docuBlue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Secure Storage
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Your documents are encrypted and stored securely in the cloud,
                  accessible only by you and those you authorize.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="bg-docuBlue-100 dark:bg-blue-900 rounded-lg p-3 inline-block mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-docuBlue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Easy Collaboration
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Share documents with team members and stakeholders,
                  controlling access permissions for each user.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="bg-docuBlue-100 dark:bg-blue-900 rounded-lg p-3 inline-block mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-docuBlue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Version Control
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Track changes and revert to previous versions whenever needed,
                  ensuring you never lose important document history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center flex-col md:flex-row">
            <div className="mb-4 md:mb-0">
              <DocuVerseLogo className="h-8 w-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                &copy; 2023 DocuVerse. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-500 hover:text-docuBlue transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-docuBlue transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-docuBlue transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
