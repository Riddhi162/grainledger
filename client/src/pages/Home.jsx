import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
     
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dalali Transaction Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage your grain trading transactions efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Transaction Card */}
          <Link to="/transactions/add" className="card hover:shadow-xl transition-shadow duration-200 group">
            <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-lg mb-4 group-hover:bg-primary-200 transition-colors">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Transaction</h3>
            <p className="text-gray-600">Create a new transaction record</p>
          </Link>

          {/* Daily Transactions Card */}
          <Link to="/transactions/daily" className="card hover:shadow-xl transition-shadow duration-200 group">
            <div className="flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-lg mb-4 group-hover:bg-secondary-200 transition-colors">
              <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Daily Transactions</h3>
            <p className="text-gray-600">View transactions by date</p>
          </Link>

          {/* Party Reports Card */}
          <Link to="/transactions/party" className="card hover:shadow-xl transition-shadow duration-200 group">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Party Reports</h3>
            <p className="text-gray-600">Generate party-wise reports</p>
          </Link>

          {/* Manage Items Card */}
          <Link to="/manage/items" className="card hover:shadow-xl transition-shadow duration-200 group">
            <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-lg mb-4 group-hover:bg-yellow-200 transition-colors">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Items</h3>
            <p className="text-gray-600">Add and manage grain items</p>
          </Link>

          {/* Manage Clients Card */}
          <Link to="/manage/clients" className="card hover:shadow-xl transition-shadow duration-200 group">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Clients</h3>
            <p className="text-gray-600">Add and manage clients</p>
          </Link>

          {/* Manage Cities Card */}
          <Link to="/manage/cities" className="card hover:shadow-xl transition-shadow duration-200 group">
            <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Cities</h3>
            <p className="text-gray-600">Add and manage cities</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
