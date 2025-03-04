import { format } from "date-fns";

const Footer = () => {
  const currentDate = format(new Date(), "MMMM d, yyyy");
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            &copy; 2024 Goals Tracking System
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {currentDate}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
